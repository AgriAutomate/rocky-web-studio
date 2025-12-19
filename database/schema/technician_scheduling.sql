-- Rocky Web Studio / Technician Scheduling & Routing
-- Schema: database/schema/technician_scheduling.sql
--
-- Creates:
--  - public.technician_availability (technician schedule and capacity)
--  - public.technician_skills (technician skill matrix)
--  - public.service_skill_requirements (service type skill requirements)
--  - public.manual_assignments (queue for manual assignment)
-- Adds:
--  - Constraints for data validation
--  - Indexes for performance
--  - Foreign key relationships
--
-- Note: Overlap prevention for availability slots is handled at application level
-- to avoid requiring btree_gist extension

-- -----------------------------------------------------------------------------
-- Table: technician_availability
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technician_availability (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Technician identification
  technician_id VARCHAR(100) NOT NULL,
  
  -- Availability window
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Capacity tracking
  status VARCHAR(50) NOT NULL DEFAULT 'available', -- 'available', 'booked', 'unavailable'
  current_load_minutes INTEGER NOT NULL DEFAULT 0,
  max_capacity_minutes INTEGER NOT NULL DEFAULT 480, -- 8-hour day (480 minutes)
  
  -- Location tracking
  last_job_location VARCHAR(255), -- Last job location for routing
  home_base_location VARCHAR(255), -- Technician's home/base location
  
  -- Constraints
  CONSTRAINT technician_availability_status_values
    CHECK (status IN ('available', 'booked', 'unavailable', 'break')),
  
  CONSTRAINT technician_availability_time_valid
    CHECK (end_time > start_time),
  
  CONSTRAINT technician_availability_load_valid
    CHECK (current_load_minutes >= 0 AND current_load_minutes <= max_capacity_minutes),
  
  CONSTRAINT technician_availability_capacity_valid
    CHECK (max_capacity_minutes > 0),
  
  -- Note: Overlap prevention handled at application level
  -- GIST exclusion constraint requires btree_gist extension
  -- For now, we'll handle overlaps in the workflow logic
);

-- Indexes for technician_availability
CREATE INDEX IF NOT EXISTS idx_technician_availability_technician_id
  ON public.technician_availability (technician_id);

CREATE INDEX IF NOT EXISTS idx_technician_availability_date
  ON public.technician_availability (date DESC);

CREATE INDEX IF NOT EXISTS idx_technician_availability_status
  ON public.technician_availability (status)
  WHERE status = 'available';

-- Composite index for availability queries
CREATE INDEX IF NOT EXISTS idx_technician_availability_date_status
  ON public.technician_availability (date, status, technician_id)
  WHERE status = 'available';

-- Index for capacity queries
CREATE INDEX IF NOT EXISTS idx_technician_availability_capacity
  ON public.technician_availability (technician_id, date, current_load_minutes)
  WHERE status = 'available';

-- Trigger for updated_at
CREATE TRIGGER trg_technician_availability_set_updated_at
  BEFORE UPDATE ON public.technician_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: technician_skills
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technician_skills (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Technician identification
  technician_id VARCHAR(100) NOT NULL,
  
  -- Skill details
  skill_name VARCHAR(100) NOT NULL,
  skill_level VARCHAR(50) NOT NULL, -- 'junior', 'mid', 'senior'
  certified BOOLEAN NOT NULL DEFAULT false,
  
  -- Certification details
  certification_date DATE,
  certification_expiry DATE,
  certification_provider VARCHAR(255),
  
  -- Constraints
  CONSTRAINT technician_skills_level_values
    CHECK (skill_level IN ('junior', 'mid', 'senior', 'expert')),
  
  CONSTRAINT technician_skills_unique
    UNIQUE (technician_id, skill_name)
);

-- Indexes for technician_skills
CREATE INDEX IF NOT EXISTS idx_technician_skills_technician_id
  ON public.technician_availability (technician_id);

CREATE INDEX IF NOT EXISTS idx_technician_skills_skill_name
  ON public.technician_skills (skill_name);

CREATE INDEX IF NOT EXISTS idx_technician_skills_certified
  ON public.technician_skills (certified)
  WHERE certified = true;

-- Composite index for skill matching queries
CREATE INDEX IF NOT EXISTS idx_technician_skills_skill_certified
  ON public.technician_skills (skill_name, certified, skill_level)
  WHERE certified = true;

-- Trigger for updated_at
CREATE TRIGGER trg_technician_skills_set_updated_at
  BEFORE UPDATE ON public.technician_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: service_skill_requirements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_skill_requirements (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Service type
  service_type VARCHAR(50) NOT NULL,
  
  -- Required skill
  required_skill VARCHAR(100) NOT NULL,
  minimum_level VARCHAR(50) NOT NULL DEFAULT 'mid', -- 'junior', 'mid', 'senior'
  certification_required BOOLEAN NOT NULL DEFAULT true,
  
  -- Priority (for multiple skills)
  priority INTEGER NOT NULL DEFAULT 1, -- Lower number = higher priority
  
  -- Constraints
  CONSTRAINT service_skill_requirements_level_values
    CHECK (minimum_level IN ('junior', 'mid', 'senior', 'expert')),
  
  CONSTRAINT service_skill_requirements_unique
    UNIQUE (service_type, required_skill),
  
  CONSTRAINT service_skill_requirements_priority_positive
    CHECK (priority > 0)
);

-- Indexes for service_skill_requirements
CREATE INDEX IF NOT EXISTS idx_service_skill_requirements_service_type
  ON public.service_skill_requirements (service_type);

CREATE INDEX IF NOT EXISTS idx_service_skill_requirements_skill
  ON public.service_skill_requirements (required_skill);

-- Composite index for skill matching
CREATE INDEX IF NOT EXISTS idx_service_skill_requirements_service_skill
  ON public.service_skill_requirements (service_type, required_skill, minimum_level);

-- Trigger for updated_at
CREATE TRIGGER trg_service_skill_requirements_set_updated_at
  BEFORE UPDATE ON public.service_skill_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: manual_assignments (Queue for manual assignment)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.manual_assignments (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Booking reference
  booking_id UUID NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.service_leads(id) ON DELETE CASCADE,
  
  -- Assignment details
  assignment_reason TEXT NOT NULL, -- Why manual assignment needed
  priority VARCHAR(50) NOT NULL DEFAULT 'normal', -- 'urgent', 'normal', 'low'
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'assigned', 'resolved'
  
  -- Assignment metadata
  attempted_auto_assign BOOLEAN NOT NULL DEFAULT true,
  auto_assign_failure_reason TEXT,
  assigned_technician_id VARCHAR(100),
  assigned_at TIMESTAMP WITH TIME ZONE,
  assigned_by VARCHAR(100), -- User who manually assigned
  
  -- Constraints
  CONSTRAINT manual_assignments_priority_values
    CHECK (priority IN ('urgent', 'normal', 'low')),
  
  CONSTRAINT manual_assignments_status_values
    CHECK (status IN ('pending', 'assigned', 'resolved', 'cancelled'))
);

-- Indexes for manual_assignments
CREATE INDEX IF NOT EXISTS idx_manual_assignments_booking_id
  ON public.manual_assignments (booking_id);

CREATE INDEX IF NOT EXISTS idx_manual_assignments_status
  ON public.manual_assignments (status)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_manual_assignments_priority
  ON public.manual_assignments (priority, created_at)
  WHERE status = 'pending';

-- Trigger for updated_at
CREATE TRIGGER trg_manual_assignments_set_updated_at
  BEFORE UPDATE ON public.manual_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Sample Data: service_skill_requirements
-- -----------------------------------------------------------------------------
INSERT INTO public.service_skill_requirements (service_type, required_skill, minimum_level, certification_required, priority)
VALUES 
  ('emergency', 'emergency_response', 'senior', true, 1),
  ('emergency', 'safety_certification', 'mid', true, 2),
  ('standard', 'general_service', 'mid', false, 1),
  ('premium', 'premium_service', 'senior', true, 1),
  ('premium', 'customer_service', 'mid', false, 2),
  ('consultation', 'consultation_skills', 'mid', false, 1)
ON CONFLICT (service_type, required_skill) DO UPDATE SET
  minimum_level = EXCLUDED.minimum_level,
  certification_required = EXCLUDED.certification_required,
  priority = EXCLUDED.priority,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- Comments for Documentation
-- -----------------------------------------------------------------------------

COMMENT ON TABLE public.technician_availability IS 'Technician availability windows and capacity tracking for scheduling';
COMMENT ON TABLE public.technician_skills IS 'Technician skill matrix for matching technicians to service requirements';
COMMENT ON TABLE public.service_skill_requirements IS 'Service type skill requirements for automatic technician matching';
COMMENT ON TABLE public.manual_assignments IS 'Queue for bookings requiring manual technician assignment';

COMMENT ON COLUMN public.technician_availability.technician_id IS 'Unique identifier for technician';
COMMENT ON COLUMN public.technician_availability.current_load_minutes IS 'Current booked time in minutes for this availability window';
COMMENT ON COLUMN public.technician_availability.max_capacity_minutes IS 'Maximum capacity in minutes (default 480 = 8 hours)';
COMMENT ON COLUMN public.technician_availability.last_job_location IS 'Last job location for routing optimization';
COMMENT ON COLUMN public.technician_availability.home_base_location IS 'Technician home/base location for routing';

COMMENT ON COLUMN public.technician_skills.skill_level IS 'Skill proficiency level: junior, mid, senior, expert';
COMMENT ON COLUMN public.technician_skills.certified IS 'Whether technician is certified in this skill';
COMMENT ON COLUMN public.service_skill_requirements.minimum_level IS 'Minimum skill level required for this service type';
COMMENT ON COLUMN public.service_skill_requirements.certification_required IS 'Whether certification is required for this skill';

COMMENT ON COLUMN public.manual_assignments.assignment_reason IS 'Reason why manual assignment was needed (no available tech, conflict, etc.)';
COMMENT ON COLUMN public.manual_assignments.auto_assign_failure_reason IS 'Reason why automatic assignment failed';
