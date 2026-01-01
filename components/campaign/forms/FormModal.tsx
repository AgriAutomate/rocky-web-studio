"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WebsiteUpgradeForm from "./WebsiteUpgradeForm";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FormModal = ({ isOpen, onClose }: FormModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Book Your Free Website Upgrade Call
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            Fill in your details and we'll call you within 24 hours to discuss how we can help your business.
          </p>
        </DialogHeader>
        
        <div className="mt-4">
          <WebsiteUpgradeForm onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormModal;
