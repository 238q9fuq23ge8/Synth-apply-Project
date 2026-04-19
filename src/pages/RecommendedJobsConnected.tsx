import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScopeJobSeekerLayout } from "@/components/jobseeker/ScopeJobSeekerLayout";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Loader2, 
  X, 
  Star, 
  Wallet, 
  BadgeCheck, 
  CalendarDays,
  RefreshCw,
  Filter,
  ExternalLink,
  Briefcase,
  MapPin,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { 
  fetchJobRecommendations, 
  filterRecommendations,
  sortRecommendations,
  getMatchScoreColor,
  getMatchScoreLabel,
  type JobRecommendation,
  type RecommendationsResponse,
  type RecommendationFilters
} from "@/services/recommendationsApi";
import api from "@/lib/api";

function scorePillClass(score: number) {
  if (score >= 80) return "bg-[#009605] text-white";
  if (score >= 60) return "bg-[#2862eb] text-white";
  return "bg-[#ff6900] text-white";
}

export default function RecommendedJobsConnected() {
  const navigate = useNavigate();
  const { daysLeft: trialDaysLeft } = useTrialCountdown();
  
  // State
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<JobRecommendation[]>([]);
  const [responseData, setResponseData] = useState<RecommendationsResponse | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobRecommendation | null>(null);
  
  // Filters
  const [minScore, setMinScore] = useState(30);
  const [region, setRegion] = useState("");
  const [sourceFilter, setSourceFilter] = useState<'all' | 'internal' | 'external'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'company' | 'location'>('score');
  const [searchQuery, setSearchQuery] = useState("");

  // Credits
  const [credits, setCredits] = useState(0);

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations();
  }, []);

  // Apply filters when recommendations or filters change
  useEffect(() => {
    if (recommendations.length > 0) {
      applyFilters();
    }
  }, [recommendations, minScore, region, sourceFilter, sortBy, searchQuery]);

  /**
   * Load job recommendations from backend
   */
  const loadRecommendations = async (forceRefresh = false) => {
    setLoading(true);
    
    try {
      const response = await fetchJobRecommendations({
        limit: 50,
        min_score: minScore,
        region: region || undefined,
        force_refresh: forceRefresh,
      });

      setRecommendations(response.recommendations);
      setFilteredRecommendations(response.recommendations);
      setResponseData(response);
      setCredits(response.credits_remaining);

      toast.success(
        response.cached 
          ? '✅ Loaded cached recommendations' 
          : '✅ Loaded fresh recommendations'
      );

      // Update credits in localStorage
      localStorage.setItem('remaining_credits', response.credits_remaining.toString());
      
    } catch (error: any) {
      console.error('Failed to load recommendations:', error);
      toast.error(error.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply filters to recommendations
   */
  const applyFilters = () => {
    let filtered = [...recommendations];

    // Apply backend filters
    const filters: RecommendationFilters = {
      min_score: minScore,
      location: region || undefined,
      source: sourceFilter,
    };

    filtered = filterRecommendations(filtered, filters);

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered = sortRecommendations(filtered, sortBy);

    setFilteredRecommendations(filtered);
  };

  /**
   * Handle apply to internal job
   */
  const handleApplyToJob = async (job: JobRecommendation) => {
    if (!job.is_internal) {
      // External job - open in new tab
      if (job.url) {
        window.open(job.url, '_blank');
      }
      return;
    }

    // Internal job - apply through our system
    try {
      const cvId = localStorage.getItem('current_cv_id');
      if (!cvId) {
        toast.error('Please upload a CV first');
        navigate('/upload-cv');
        return;
      }

      const response = await api.post('/v1/company-jobs/apply', {
        job_id: job.id.replace('internal-', ''),
        cv_id: cvId,
      });

      if (response.data.ok) {
        toast.success('✅ Application submitted successfully!');
        setSelectedJob(null);
      }
    } catch (error: any) {
      console.error('Failed to apply:', error);
      toast.error(error.response?.data?.detail || 'Failed to apply to job');
    }
  };

  /**
   * Refresh recommendations
   */
  const handleRefresh = () => {
    loadRecommendations(true);
  };

  return (
    <ScopeJobSeekerLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#f1f5f9] pb-20">
        {/* Header */}
        <div className="bg-white border-b border-[#e5e7eb] sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#111827]">AI Job Recommendations</h1>
                  <p className="text-sm text-[#6b7280]">
                    {responseData?.cached ? '📦 Cached results' : '✨ Fresh recommendations'} • 
                    {filteredRecommendations.length} jobs found
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Credits Display */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#fef3c7] to-[#fde68a] rounded-lg">
                  <Wallet className="w-4 h-4 text-[#92400e]" />
                  <span className="text-sm font-semibold text-[#92400e]">
                    {credits} Credits
                  </span>
                </div>

                {/* Refresh Button */}
                <Button
                  onClick={handleRefresh}
                  disabled={loading}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-[#6366f1]" />
              <h2 className="text-lg font-semibold text-[#111827]">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="col-span-2"
              />

              {/* Min Score */}
              <Select value={minScore.toString()} onValueChange={(v) => setMinScore(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30% and above</SelectItem>
                  <SelectItem value="50">50% and above</SelectItem>
                  <SelectItem value="70">70% and above</SelectItem>
                  <SelectItem value="90">90% and above</SelectItem>
                </SelectContent>
              </Select>

              {/* Source Filter */}
              <Select value={sourceFilter} onValueChange={(v: any) => setSourceFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="internal">Internal Only</SelectItem>
                  <SelectItem value="external">External Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Match Score</SelectItem>
                  <SelectItem value="date">Date Posted</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        {responseData && (
          <div className="max-w-7xl mx-auto px-6 pb-6">
            <div className="bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] rounded-xl border border-[#bfdbfe] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1e40af]">
                    Matched to: {responseData.profile_used.title}
                  </p>
                  <p className="text-xs text-[#3b82f6]">
                    {responseData.profile_used.skills_count} skills analyzed
                  </p>
                </div>
                {responseData.search_patterns.top_keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {responseData.search_patterns.top_keywords.slice(0, 3).map((keyword, i) => (
                      <span key={i} className="px-2 py-1 bg-white rounded-full text-xs text-[#1e40af] border border-[#bfdbfe]">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#6366f1] animate-spin mb-4" />
              <p className="text-lg font-medium text-[#111827]">Loading recommendations...</p>
              <p className="text-sm text-[#6b7280]">Analyzing your profile and matching jobs</p>
            </div>
          </div>
        )}

        {/* Job Cards */}
        {!loading && filteredRecommendations.length > 0 && (
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 gap-4">
              {filteredRecommendations.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[#111827]">{job.title}</h3>
                        {job.is_internal && (
                          <BadgeCheck className="w-5 h-5 text-[#6366f1]" />
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[#6b7280] mb-3">
                        {job.company && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.company}
                          </div>
                        )}
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                        )}
                      </div>

                      {job.snippet && (
                        <p className="text-sm text-[#4b5563] mb-3 line-clamp-2">
                          {job.snippet}
                        </p>
                      )}

                      {/* Match Reasons */}
                      {job.match_reasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.match_reasons.slice(0, 3).map((reason, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-[#f3f4f6] text-[#4b5563] rounded-full">
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Match Score */}
                    <div className="flex flex-col items-end gap-2">
                      <div className={cn(
                        "px-4 py-2 rounded-lg font-bold text-lg",
                        scorePillClass(job.score)
                      )}>
                        {job.score}%
                      </div>
                      <span className="text-xs text-[#6b7280]">
                        {getMatchScoreLabel(job.score)}
                      </span>
                      {job.is_internal ? (
                        <span className="text-xs px-2 py-1 bg-[#eff6ff] text-[#2563eb] rounded-full">
                          Internal
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-[#f3f4f6] text-[#6b7280] rounded-full">
                          {job.source}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRecommendations.length === 0 && (
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center justify-center py-20">
              <Sparkles className="w-16 h-16 text-[#d1d5db] mb-4" />
              <p className="text-lg font-medium text-[#111827] mb-2">No recommendations found</p>
              <p className="text-sm text-[#6b7280] mb-4">Try adjusting your filters or upload a CV</p>
              <Button onClick={() => navigate('/upload-cv')}>
                Upload CV
              </Button>
            </div>
          </div>
        )}

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#111827] mb-2">{selectedJob.title}</h2>
                    <p className="text-lg text-[#6b7280]">{selectedJob.company}</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-[#6b7280] hover:text-[#111827]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "px-6 py-3 rounded-lg font-bold text-2xl",
                      scorePillClass(selectedJob.score)
                    )}>
                      {selectedJob.score}% Match
                    </div>
                    {selectedJob.is_internal && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#eff6ff] text-[#2563eb] rounded-lg">
                        <BadgeCheck className="w-5 h-5" />
                        <span className="font-medium">Posted on our platform</span>
                      </div>
                    )}
                  </div>

                  {selectedJob.snippet && (
                    <div>
                      <h3 className="font-semibold text-[#111827] mb-2">Description</h3>
                      <p className="text-[#4b5563]">{selectedJob.snippet}</p>
                    </div>
                  )}

                  {selectedJob.match_reasons.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-[#111827] mb-2">Why this matches you</h3>
                      <ul className="space-y-2">
                        {selectedJob.match_reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-[#4b5563]">
                            <Star className="w-4 h-4 text-[#fbbf24] mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleApplyToJob(selectedJob)}
                      className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5]"
                    >
                      {selectedJob.is_internal ? 'Apply Now' : 'View Job'}
                      {!selectedJob.is_internal && <ExternalLink className="w-4 h-4 ml-2" />}
                    </Button>
                    <Button
                      onClick={() => setSelectedJob(null)}
                      variant="outline"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScopeJobSeekerLayout>
  );
}
