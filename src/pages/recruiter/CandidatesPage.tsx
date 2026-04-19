import { useState, useEffect } from 'react';
import { Users, Briefcase, Clock, XCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { toast as sonnerToast } from 'sonner';
import CandidateDetailFullPage from './CandidateDetailFullPage';
import ChangeStatusModal from './ChangeStatusModal';
import JobDetailsModal from './JobDetailsModal';
import api from '@/lib/api';

// Local interface for display
interface CandidateDisplay {
  id: string;
  name: string;
  position: string;
  applied_date: string;
  location: string;
  experience: string;
  match_score: number;
  status: 'New' | 'Pending' | 'Shortlisted' | 'Rejected' | 'Hired';
  avatar?: string;
  job_id: string;
  summary?: string;
  experience_details?: any[];
  education?: any[];
  skills?: string[];
  cv_id?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  postedDate: string;
  salary: string;
  location: string;
  workType: string;
  description: string;
  requiredSkills: string[];
}

interface CandidateStats {
  total: number;
  hired: number;
  pending: number;
  rejected: number;
  new: number;
  shortlisted: number;
  last_24_hours: number;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateDisplay[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateDisplay[]>([]);
  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'shortlisted' | 'highMatch'>('all');
  const [searchName, setSearchName] = useState('');
  const [filterJobPosition, setFilterJobPosition] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMatchScore, setFilterMatchScore] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDisplay | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const { toast } = useToast();

  // Load candidates and stats on mount and when filters change
  useEffect(() => {
    loadCandidates();
    loadStats();
  }, [currentPage, filterJobPosition, filterStatus, filterMatchScore, searchName]);

  // Apply tab filter
  useEffect(() => {
    applyTabFilter();
  }, [activeTab, candidates]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      // Fetch all jobs first, then get applications for each
      const jobsRes = await api.get("/v1/recruiter/jobs");
      const jobs = jobsRes.data?.jobs || jobsRes.data || [];

      const allCandidates: CandidateDisplay[] = [];

      for (const job of jobs.slice(0, 5)) {
        try {
          const appRes = await api.get(`/v1/recruiter/jobs/${job.id}/applications`, {
            params: { page: currentPage, page_size: 20 },
          });
          const apps = appRes.data?.applications || appRes.data || [];
          apps.forEach((a: any) => {
            allCandidates.push({
              id: String(a.id),
              name: a.applicant_name || a.name || a.user?.name || a.user?.email?.split("@")[0] || "Candidate",
              position: job.title || "Position",
              applied_date: (a.applied_at || a.created_at) ? new Date(a.applied_at || a.created_at).toLocaleDateString() : "—",
              location: a.location || job.location || "—",
              experience: a.experience || "—",
              match_score: a.match_score || a.score || 0,
              status: mapStatus(a.status),
              job_id: String(job.id),
              cv_id: a.cv_id,
              skills: a.skills || [],
            });
          });
          if (appRes.data?.total) setTotalPages(Math.ceil(appRes.data.total / 20));
        } catch {
          // skip failed job
        }
      }

      setCandidates(allCandidates);
    } catch {
      sonnerToast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  function mapStatus(s: string): CandidateDisplay["status"] {
    const m: Record<string, CandidateDisplay["status"]> = {
      pending: "Pending", reviewing: "Pending", shortlisted: "Shortlisted",
      rejected: "Rejected", hired: "Hired", new: "New", applied: "New",
    };
    return m[(s || "").toLowerCase()] || "New";
  }

  const loadStats = async () => {
    try {
      const res = await api.get("/v1/recruiter/analytics");
      const d = res.data;
      setStats({
        total: d.total_candidates ?? 0,
        hired: d.hired ?? 0,
        pending: d.candidates_in_review ?? 0,
        rejected: 0,
        new: d.candidates_added_today ?? 0,
        shortlisted: 0,
        last_24_hours: d.candidates_added_today ?? 0,
      });
    } catch {
      // keep null stats
    }
  };

  const applyTabFilter = () => {
    let filtered = [...candidates];

    if (activeTab === 'new') {
      filtered = filtered.filter(c => c.status === 'New');
    } else if (activeTab === 'shortlisted') {
      filtered = filtered.filter(c => c.status === 'Shortlisted');
    } else if (activeTab === 'highMatch') {
      filtered = filtered.filter(c => c.match_score >= 85);
    }

    setFilteredCandidates(filtered);
  };

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      await api.patch(`/v1/recruiter/applications/${candidateId}`, {
        status: newStatus.toLowerCase(),
      });
      setCandidates(prev =>
        prev.map(c => c.id === candidateId ? { ...c, status: newStatus as any } : c)
      );
      setShowStatusModal(false);
      setSelectedCandidate(null);
      loadStats();
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch {
      sonnerToast.error('Failed to update status');
    }
  };

  const handleDownloadCV = async (candidate: CandidateDisplay) => {
    if (!candidate.cv_id) {
      sonnerToast.error('No CV available for this candidate');
      return;
    }

    try {
      // Mock download - replace with API call when backend is ready
      sonnerToast.success('✅ CV downloaded successfully!');
    } catch (error: any) {
      console.error('Failed to download CV:', error);
      sonnerToast.error('Failed to download CV');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Shortlisted': return 'bg-purple-500';
      case 'Rejected': return 'bg-red-500';
      case 'Hired': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <>
      {showDetailModal && selectedCandidate ? (
        <CandidateDetailFullPage
          candidate={selectedCandidate}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCandidate(null);
          }}
          onStatusChange={() => {
            setShowDetailModal(false);
            setShowStatusModal(true);
          }}
        />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          
          {/* Success Notification - Exact match from image */}
          {showSuccessNotification && (
            <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5">
              <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 flex items-center gap-3 min-w-[300px]">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Status Updated!</div>
                  <div className="text-sm text-gray-600">The status has been changed successfully</div>
                </div>
              </div>
            </div>
          )}
      {/* Header */}
      <div className="bg-white border-b px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Candidates</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              View And Manage Candidates Who Applied To Your Jobs, Track Their Progress, And Take Hiring Actions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                G
              </div>
              <div>
                <div className="font-medium">Google</div>
                <div className="text-xs">Demo | Free Account</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">48%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Total Candidates</div>
                <div className="text-3xl font-bold text-blue-600">{stats?.total || 0}</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Hired Candidates</div>
                <div className="text-3xl font-bold text-green-600">{stats?.hired || 0}</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Pending</div>
                <div className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Rejected</div>
                <div className="text-3xl font-bold text-red-600">{stats?.rejected || 0}</div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">In Last 24 Hours</div>
                <div className="text-3xl font-bold text-gray-700">{stats?.last_24_hours || 0}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6">
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Search</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Candidates</label>
              <Input
                placeholder="Search By Name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Job Position</label>
              <Select value={filterJobPosition} onValueChange={setFilterJobPosition}>
                <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select Job Position" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer">All Positions</SelectItem>
                  <SelectItem value="Senior Frontend Developer" className="hover:bg-gray-100 cursor-pointer">Senior Frontend Developer</SelectItem>
                  <SelectItem value="UX Designer" className="hover:bg-gray-100 cursor-pointer">UX Designer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer">All Status</SelectItem>
                  <SelectItem value="New" className="hover:bg-gray-100 cursor-pointer">New</SelectItem>
                  <SelectItem value="Pending" className="hover:bg-gray-100 cursor-pointer">Pending</SelectItem>
                  <SelectItem value="Shortlisted" className="hover:bg-gray-100 cursor-pointer">Shortlisted</SelectItem>
                  <SelectItem value="Rejected" className="hover:bg-gray-100 cursor-pointer">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Match Score</label>
              <Select value={filterMatchScore} onValueChange={setFilterMatchScore}>
                <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select Match Score" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer">All Scores</SelectItem>
                  <SelectItem value="90" className="hover:bg-gray-100 cursor-pointer">90% and above</SelectItem>
                  <SelectItem value="70" className="hover:bg-gray-100 cursor-pointer">70% and above</SelectItem>
                  <SelectItem value="50" className="hover:bg-gray-100 cursor-pointer">50% and above</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-10 rounded-md font-medium">
            Filter
          </Button>
        </div>
      </div>

      {/* Candidates List */}
      <div className="px-4 sm:px-6 md:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <h3 className="font-semibold text-lg">Candidates</h3>
              <Input
                placeholder="Search Jobs By Title, Company Or Status..."
                className="w-full sm:w-96"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({candidates.length})
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'new'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                New ({candidates.filter(c => c.status === 'New').length})
              </button>
              <button
                onClick={() => setActiveTab('shortlisted')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'shortlisted'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Shortlisted ({candidates.filter(c => c.status === 'Shortlisted').length})
              </button>
              <button
                onClick={() => setActiveTab('highMatch')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'highMatch'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                High Match ({candidates.filter(c => c.match_score >= 85).length})
              </button>
            </div>

            {/* Candidate Cards - Compact Layout */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading candidates...</p>
                  </div>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">No candidates found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                  </div>
                </div>
              ) : (
                filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar and Name */}
                  <div className="flex items-center gap-3 sm:w-48">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{candidate.name}</div>
                      <div className="text-xs text-gray-600 truncate">{candidate.position}</div>
                    </div>
                  </div>

                  {/* Info row on mobile */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 sm:contents text-sm text-gray-600">
                    <span className="sm:w-32">Applied {candidate.applied_date}</span>
                    <span className="sm:w-32">{candidate.location}</span>
                    <span className="sm:w-24">{candidate.experience}</span>
                  </div>

                  {/* Match Score Circle */}
                  <div className="flex items-center gap-3 sm:block sm:w-16 sm:flex sm:justify-center">
                    <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center font-bold text-xs ${
                      candidate.match_score >= 90 ? 'border-green-500 text-green-500' :
                      candidate.match_score >= 70 ? 'border-yellow-500 text-yellow-500' :
                      'border-red-500 text-red-500'
                    }`}>
                      {candidate.match_score}%
                    </div>
                    {/* Status badge next to score on mobile */}
                    <span className={`sm:hidden inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </div>

                  {/* Status Badge - desktop only */}
                  <div className="hidden sm:block sm:w-28">
                    <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 sm:ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs h-8 px-3"
                    >
                      View CV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedJob({
                          id: candidate.job_id,
                          title: 'Product Designer',
                          company: 'ScopeAI',
                          postedDate: '2 days ago',
                          salary: '$80k - $120k',
                          location: 'Remote',
                          workType: 'Full-time',
                          description: 'Amazing UI/UX Principles **Gains Proficiency **Wireframing & Prototyping **Clean, Intuitive Interface Design.',
                          requiredSkills: ['Communication', 'Adobe XD', 'UI Research', 'Design Systems'],
                        });
                        setShowJobModal(true);
                      }}
                      className="text-gray-700 hover:bg-gray-100 text-xs h-8 px-3"
                    >
                      Job Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setShowStatusModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3"
                    >
                      Change Status
                    </Button>
                  </div>
                </div>
              ))
              )}
            </div>

            {/* Pagination */}
            {!loading && filteredCandidates.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className="text-gray-600"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {currentPage}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="text-gray-600"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showStatusModal && selectedCandidate && (
        <ChangeStatusModal
          candidate={selectedCandidate}
          onClose={() => setShowStatusModal(false)}
          onSave={handleStatusChange}
        />
      )}

      {showJobModal && selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setShowJobModal(false)}
          candidateCount={12}
        />
      )}
    </div>
      )}
    </>
  );
}
