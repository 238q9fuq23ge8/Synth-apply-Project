import { ReactNode } from "react";
import { Zap } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle: string;
  creditsLeft: number;
  trialDaysLeft?: number | null;
  /** Extra actions in header row (e.g. Refresh) */
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Override trial subtext color (e.g. urgent trial in Job Opportunities mock). */
  trialSubtextClassName?: string;
  /** Job Opportunities uses global header nav only — hide left rail. */
  hideSidebar?: boolean;
};

/**
 * Shared shell for Job Seeker pages (Recommended Jobs, Job Matches / Job Search)
 * aligned with AI Auto Apply: #f5f5f7 bg, #2862eb title, cream credits pill.
 */
export function ScopeJobSeekerLayout({
  title,
  subtitle,
  creditsLeft,
  trialDaysLeft,
  headerRight,
  children,
  className,
  trialSubtextClassName = "text-gray-500",
  hideSidebar = false,
}: Props) {
  const trial =
    trialDaysLeft != null && !Number.isNaN(trialDaysLeft) ? trialDaysLeft : 4;

  return (
    <div className={cn("flex min-h-[calc(100vh-72px)] bg-[#f5f5f7]", className)}>
      {!hideSidebar && (
        <aside className="hidden md:block sticky top-[72px] h-[calc(100vh-72px)] w-64 shrink-0 bg-white border-r border-[#f2f2f2] overflow-y-auto">
          <Sidebar />
        </aside>
      )}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-[1528px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
            <div className="min-w-0">
              <h1 className="text-[clamp(1.75rem,4vw,2.2rem)] font-bold text-[#2862eb] leading-tight mb-1">
                {title}
              </h1>
              <p className="text-[16px] text-[#4b5563] max-w-[720px] leading-relaxed">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {headerRight}
              <div className="bg-[#fff8e1] border border-[#fce9a8] rounded-lg py-2.5 px-4 min-w-[200px] shadow-sm">
                <div className="flex items-center gap-2 font-bold text-[#111827] text-[13px]">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" strokeWidth={1.5} />
                  <span>
                    {creditsLeft} Credits Left
                  </span>
                </div>
                <p className={`text-[11px] font-medium mt-0.5 ml-6 ${trialSubtextClassName}`}>
                  Trial expires in {trial} days
                </p>
              </div>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
