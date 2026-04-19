import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type JobOfferFilterMeta = {
  isInternal: boolean;
  remote: boolean;
  employment: "full" | "part";
};

type Props = {
  title: string;
  company: string;
  location: string;
  postedLabel: string;
  meta: JobOfferFilterMeta;
  hasApplied: boolean;
  isApplying: boolean;
  onShowDetails: () => void;
  onApply: () => void;
};

function CompanyLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn("shrink-0 overflow-hidden", className)}
      aria-hidden
    >
      <img src="/logo.png" alt="Company Logo" className="w-full h-full object-contain" />
    </div>
  );
}

export function JobOpportunityCard({
  title,
  company,
  location,
  postedLabel,
  meta,
  hasApplied,
  isApplying,
  onShowDetails,
  onApply,
}: Props) {
  const tags: { label: string; className: string }[] = [
    meta.isInternal
      ? { label: "Internal", className: "bg-[#8B5CF6] text-white" }
      : { label: "External", className: "bg-[#F59E0B] text-white" },
    meta.remote
      ? { label: "Remote", className: "bg-[#10B981] text-white" }
      : {
          label: meta.employment === "full" ? "Full Time" : "Part Time",
          className: "bg-[#3B82F6] text-white",
        },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e8e8ed] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 sm:p-5 flex flex-col h-full hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <CompanyLogo className="w-9 h-9" />
        <div className="flex flex-wrap gap-1.5 justify-end">
          {tags.map((t) => (
            <span
              key={`${t.label}-${t.className}`}
              className={cn(
                "text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap",
                t.className
              )}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <h3 className="text-[15px] sm:text-base font-bold text-[#111827] leading-snug mb-1 line-clamp-2">
        {title}
      </h3>
      <p className="text-[13px] text-[#6b7280] font-medium mb-3 line-clamp-2">
        {company} <span className="text-[#d1d5db]">•</span> {location}
      </p>

      <div className="flex items-center gap-1.5 text-[12px] text-[#9ca3af] font-medium mb-4 mt-auto">
        <CalendarDays className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
        {postedLabel}
      </div>

      <div className="flex gap-2 sm:gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={onShowDetails}
          className="flex-1 h-10 rounded-lg border-2 border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50 font-bold text-[13px]"
        >
          Show Details
        </Button>
        {hasApplied ? (
          <Button
            type="button"
            disabled
            className="flex-1 h-10 rounded-lg bg-[#10B981] hover:bg-[#10B981] text-white font-bold text-[13px] gap-1"
          >
            <CheckCircle2 className="w-4 h-4" />
            Applied
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onApply}
            disabled={isApplying}
            className="flex-1 h-10 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-[13px] gap-1 shadow-md shadow-blue-500/15"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
              </>
            ) : (
              <>
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
