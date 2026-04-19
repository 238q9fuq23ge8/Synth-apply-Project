import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Globe,
} from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";

interface JobModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  job,
  isOpen,
  onClose,
}) => {
  if (!job) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        onClose={onClose}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Panel */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 scale-95"
          enterTo="opacity-100 translate-y-0 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 scale-100"
          leaveTo="opacity-0 translate-y-4 scale-95"
        >
          <Dialog.Panel className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl w-full max-w-2xl mx-auto p-8 border border-gray-200/40">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {job.title}
              </h2>
              <p className="subtitle font-semibold">
                {job.company || "Company not specified"}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm text-gray-700 mb-6">
              {job.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 subtitle" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.salary_min && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>
                    {job.salary_min} - {job.salary_max || job.salary_min} USD
                  </span>
                </div>
              )}
              {/* <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 subtitle" />
                <span>Source: {job.source?.toUpperCase() || "JOOBLE"}</span>
              </div> */}
            </div>

            {/* Description */}
            {job.snippet && (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                <p className="text-gray-700 leading-relaxed">{job.snippet}</p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 ">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-gray-300 hafsa"
              >
                Close
              </Button>

              <Button
                className="btn-hero text-white font-semibold flex items-center gap-2 rounded-xl"
                onClick={() => window.open(job.url, "_blank")}
              >
                <Globe className="w-4 h-4" />
                Apply
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};
