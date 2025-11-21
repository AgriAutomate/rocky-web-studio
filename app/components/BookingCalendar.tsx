"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, startOfToday, addDays, parse, isValid } from "date-fns";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "react-day-picker/dist/style.css";

interface BookingCalendarProps {
  onDateTimeSelect: (date: string, time: string) => void;
  selectedDate?: string; // YYYY-MM-DD
  selectedTime?: string; // HH:00
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
  totalSlots: number;
  error?: string;
}

export function BookingCalendar({
  onDateTimeSelect,
  selectedDate,
  selectedTime,
}: BookingCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    selectedDate ? parse(selectedDate, "yyyy-MM-dd", new Date()) : undefined
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = startOfToday();
  const maxDate = addDays(today, 30);

  // Fetch availability when date is selected
  useEffect(() => {
    if (selectedDay) {
      const dateKey = format(selectedDay, "yyyy-MM-dd");
      fetchAvailability(dateKey);
    } else {
      setSlots([]);
    }
  }, [selectedDay]);

  // Sync with selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      const parsed = parse(selectedDate, "yyyy-MM-dd", new Date());
      if (isValid(parsed)) {
        setSelectedDay(parsed);
      }
    }
  }, [selectedDate]);

  const fetchAvailability = async (date: string) => {
    setLoading(true);
    setError(null);

    // Ensure date is formatted as YYYY-MM-DD
    const formattedDate = date; // date is already in YYYY-MM-DD format from format()
    const url = `/api/bookings/availability?date=${formattedDate}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If parsing fails, use default error message
        }
        throw new Error(errorMessage);
      }

      const data: AvailabilityResponse = await response.json();

      // Validate response structure
      if (!data) {
        throw new Error("Invalid response format from server");
      }

      // Check for error in response
      if (data.error) {
        throw new Error(data.error);
      }

      // Validate slots array exists
      if (!Array.isArray(data.slots)) {
        throw new Error("Invalid response format: slots array missing");
      }

      // Extract and set slots
      setSlots(data.slots);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load available time slots";
      setError(message);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date);
    setSlots([]); // Clear slots when date changes
    if (date && selectedTime) {
      onDateTimeSelect(format(date, "yyyy-MM-dd"), "");
    }
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDay) {
      onDateTimeSelect(format(selectedDay, "yyyy-MM-dd"), time);
    }
  };

  const formatTimeDisplay = (time: string): string => {
    const [hours] = time.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Calendar Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Select a Date
          </h3>
          <p className="text-sm text-slate-600">
            Choose a date within the next 30 days
          </p>
        </div>

        <div className="flex justify-center">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={handleDateSelect}
              disabled={(date) => {
                return date < today || date > maxDate;
              }}
              fromDate={today}
              toDate={maxDate}
              className="rounded-md"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-slate-900",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  "border border-slate-300 rounded-md",
                  "hover:bg-slate-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                  "hover:bg-slate-100 rounded-md",
                  "aria-selected:bg-teal-600 aria-selected:text-white"
                ),
                day_selected:
                  "bg-teal-600 text-white hover:bg-teal-700 focus:bg-teal-700",
                day_today: "bg-slate-100 text-slate-900 font-semibold",
                day_outside: "text-slate-400 opacity-50",
                day_disabled: "text-slate-300 cursor-not-allowed",
                day_range_middle:
                  "aria-selected:bg-slate-100 aria-selected:text-slate-900",
                day_hidden: "invisible",
              }}
              modifiersClassNames={{
                selected: "bg-teal-600 text-white hover:bg-teal-700",
                disabled: "text-slate-300 cursor-not-allowed",
              }}
            />
          </div>
        </div>

        {selectedDay && (
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Selected date:{" "}
              <span className="font-semibold text-slate-900">
                {format(selectedDay, "EEEE, MMMM d, yyyy")}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Time Slots Section */}
      {selectedDay && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Select a Time
            </h3>
            <p className="text-sm text-slate-600">
              Choose an available time slot
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <span className="ml-3 text-sm text-slate-600">
                Loading available times...
              </span>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  if (selectedDay) {
                    fetchAvailability(format(selectedDay, "yyyy-MM-dd"));
                  }
                }}
              >
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && slots.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isAvailable = slot.available;

                return (
                  <Button
                    key={slot.time}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    disabled={!isAvailable}
                    onClick={() => handleTimeSelect(slot.time)}
                    className={cn(
                      "h-12 text-sm font-medium transition-all",
                      isSelected &&
                        "bg-teal-600 text-white hover:bg-teal-700 border-teal-600",
                      !isAvailable &&
                        "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200",
                      isAvailable &&
                        !isSelected &&
                        "hover:bg-slate-50 hover:border-teal-300 hover:text-teal-700 border-slate-200 text-slate-700"
                    )}
                  >
                    {formatTimeDisplay(slot.time)}
                  </Button>
                );
              })}
            </div>
          )}

          {!loading && !error && slots.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">
                No available time slots for this date.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Please select a different date.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
