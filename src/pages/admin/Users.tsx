import { useQuery } from "@tanstack/react-query";
import { listUsers, ListUsersParams, getUserCV, downloadUserCV, exportUsersData, exportAllCVs } from "@/services/adminApi";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Eye, 
  FileText, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Flag, 
  Download, 
  ExternalLink, 
  AlertCircle,
  FileDown,
  Package,
  Users,
  Archive
} from "lucide-react";
import { toast } from "sonner";

// Enhanced types
interface CVData {
  id: string;
  name?: string;
  summary?: string;
  skills?: string[];
  validation_status?: string;
  created_at?: string;
  file_path?: string;
}

interface AdminUserRow {
  user_id: string;
  email: string;
  name?: string;
  person: string;
  plan: string;
  credits: number;
  is_admin: boolean;
  trial_ends_at?: string;
  created_at: string;
  phone?: string;
  nationality?: string;
  profession?: string;
  date_of_birth?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  years_experience?: number;
  education_level?: string;
  cv_id?: string;
  profile_completed?: boolean;
  cv_data?: CVData;
}

const AdminUsers = () => {
  const [params, setParams] = useState<ListUsersParams>({ page: 1, limit: 25 });
  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [selectedCV, setSelectedCV] = useState<any>(null);
  const [loadingCV, setLoadingCV] = useState<string | null>(null); // Track which CV is loading
  const [downloadingCV, setDownloadingCV] = useState<string | null>(null); // Track CV downloads
  const [exportingData, setExportingData] = useState<string | null>(null); // Track data exports
  const [exportingCVs, setExportingCVs] = useState(false); // Track bulk CV export

  // Debounce search input into params.search
  useEffect(() => {
    const id = window.setTimeout(() => {
      setParams((p) => ({ ...p, page: 1, search: searchInput || undefined }));
    }, 400);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const query = useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => listUsers(params),
  });

  const totalPages = useMemo(() => query.data?.total_pages || 1, [query.data]);

  const handleViewDetails = async (user: AdminUserRow) => {
    setSelectedUser(user);
  };

  const handleViewCV = async (user: AdminUserRow) => {
    if (!user.cv_id) {
      toast.error("User has no CV uploaded");
      return;
    }

    setLoadingCV(user.user_id);
    try {
      const cvData = await getUserCV(user.cv_id);
      setSelectedCV({ ...cvData, user_info: user });
      setCvModalOpen(true);
      toast.success("CV loaded successfully");
    } catch (error: any) {
      console.error("Failed to load CV:", error);
      toast.error(`Failed to load CV: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoadingCV(null);
    }
  };

  // ✅ NEW: Handle CV download
  const handleDownloadCV = async (user: AdminUserRow) => {
    if (!user.cv_id) {
      toast.error("User has no CV to download");
      return;
    }

    setDownloadingCV(user.user_id);
    try {
      await downloadUserCV(user.cv_id);
      toast.success(`CV downloaded for ${user.name || user.email}`);
    } catch (error: any) {
      console.error("Failed to download CV:", error);
      toast.error(`Failed to download CV: ${error.response?.data?.detail || error.message}`);
    } finally {
      setDownloadingCV(null);
    }
  };

  // ✅ NEW: Handle user data export
  const handleExportUsersData = async (format: 'pdf' | 'csv' | 'excel') => {
    setExportingData(format);
    try {
      await exportUsersData(format);
      toast.success(`Users data exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error(`Failed to export as ${format}:`, error);
      toast.error(`Failed to export data: ${error.response?.data?.detail || error.message}`);
    } finally {
      setExportingData(null);
    }
  };

  // ✅ NEW: Handle bulk CV export
  const handleExportAllCVs = async () => {
    setExportingCVs(true);
    try {
      await exportAllCVs();
      toast.success("All CVs exported as ZIP file");
    } catch (error: any) {
      console.error("Failed to export CVs:", error);
      toast.error(`Failed to export CVs: ${error.response?.data?.detail || error.message}`);
    } finally {
      setExportingCVs(false);
    }
  };

  const getStatusBadge = (user: AdminUserRow) => {
    if (user.profile_completed) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
    }
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Incomplete</Badge>;
  };

  const getTrialStatus = (user: AdminUserRow) => {
    if (user.plan === "free_trial") {
      if (!user.trial_ends_at) {
        return <Badge variant="outline" className="text-blue-600">Trial</Badge>;
      }
      
      const trialEnds = new Date(user.trial_ends_at);
      const now = new Date();
      const daysLeft = Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0) {
        return <Badge variant="outline" className="text-blue-600">{daysLeft}d left</Badge>;
      } else {
        return <Badge variant="destructive">Expired</Badge>;
      }
    }
    return <Badge variant="default" className="bg-purple-100 text-purple-800">Paid</Badge>;
  };

  const getCVStatusIndicator = (user: AdminUserRow) => {
    if (user.cv_id || user.cv_data) {
      return (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <FileText className="h-3 w-3" />
          <span className="font-medium">CV Available</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-sm text-gray-400">
        <AlertCircle className="h-3 w-3" />
        <span>No CV</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users Management</h1>
        <div className="text-sm text-gray-600">
          {query.data?.total || 0} users total
        </div>
      </div>

      {/* ✅ NEW: Export Actions */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-blue-900">Export Data</h3>
            <p className="text-sm text-blue-700">Download users data and CVs in various formats</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Export Users Data */}
            <Button
              onClick={() => handleExportUsersData('pdf')}
              disabled={exportingData === 'pdf'}
              size="sm"
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              {exportingData === 'pdf' ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileDown className="h-3 w-3" />
              )}
              Export PDF
            </Button>

            {/* <Button
              onClick={() => handleExportUsersData('excel')}
              disabled={exportingData === 'excel'}
              size="sm"
              variant="outline"
              className="gap-2 border-green-600 text-green-600 hover:bg-green-50"
            >
              {exportingData === 'excel' ? (
                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Package className="h-3 w-3" />
              )}
              Export Excel
            </Button> */}

            {/* <Button
              onClick={() => handleExportUsersData('csv')}
              disabled={exportingData === 'csv'}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              {exportingData === 'csv' ? (
                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Users className="h-3 w-3" />
              )}
              Export CSV
            </Button> */}

            {/* Export All CVs */}
            <Button
              onClick={handleExportAllCVs}
              disabled={exportingCVs}
              size="sm"
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {exportingCVs ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Archive className="h-3 w-3" />
              )}
              Export All CVs (ZIP)
            </Button>
          </div>
        </div>
      </Card>

      {/* Enhanced Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input
            placeholder="Search by email, name, or phone"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="md:col-span-2"
          />
          <Select onValueChange={(v) => setParams((p) => ({ ...p, page: 1, plan: v === "all" ? undefined : v }))}>
            <SelectTrigger><SelectValue placeholder="Filter by plan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free_trial">Free Trial</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => setParams((p) => ({ ...p, page: 1, person: v === "all" ? undefined : v }))}>
            <SelectTrigger><SelectValue placeholder="Filter by type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="job_seeker">Job Seeker</SelectItem>
              <SelectItem value="recruiter">Recruiter</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => setParams((p) => ({ ...p, page: 1, limit: Number(v) }))}>
            <SelectTrigger><SelectValue placeholder="Page size" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {query.isError && (
        <Card className="p-4 border-red-200 bg-red-50 text-red-700">
          <div className="flex items-center justify-between">
            <span className="text-sm">Failed to load users. Please try again.</span>
            <Button size="sm" onClick={() => query.refetch()}>Retry</Button>
          </div>
        </Card>
      )}

      {/* Enhanced Users Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[250px]">User Info</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Professional</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CV Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading && (
                <>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              )}
              {!query.isLoading && query.data?.users?.map((user: AdminUserRow) => (
                <TableRow key={user.user_id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{user.name || "No name"}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {user.location}
                        </div>
                      )}
                      {user.nationality && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Flag className="h-3 w-3 text-gray-400" />
                          {user.nationality}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.profession && (
                        <div className="flex items-center gap-1 text-sm">
                          <Briefcase className="h-3 w-3 text-gray-400" />
                          {user.profession}
                        </div>
                      )}
                      {user.date_of_birth && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(user.date_of_birth).getFullYear()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={user.person === "recruiter" ? "default" : "secondary"}>
                          {user.person === "job_seeker" ? "Job Seeker" : "Recruiter"}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{user.plan}</span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">{user.credits} credits</span>
                      </div>
                      {getTrialStatus(user)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(user)}
                      {user.is_admin && (
                        <Badge variant="destructive" className="block w-fit">Admin</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCVStatusIndicator(user)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center gap-2 justify-center flex-wrap">
                      {/* View Details Button */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(user)}
                            className="gap-1 min-w-[70px]"
                          >
                            <Eye className="h-3 w-3" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <User className="h-5 w-5" />
                              {user.name || user.email.split('@')[0]} - User Details
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* User Overview */}
                            <Card className="p-4">
                              <h3 className="font-semibold mb-3">User Information</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <label className="font-medium text-gray-600">Full Name</label>
                                  <p>{user.name || "Not provided"}</p>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-600">Email</label>
                                  <p>{user.email}</p>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-600">Phone</label>
                                  <p>{user.phone || "Not provided"}</p>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-600">Nationality</label>
                                  <p>{user.nationality || "Not provided"}</p>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-600">Profession</label>
                                  <p>{user.profession || "Not provided"}</p>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-600">Location</label>
                                  <p>{user.location || "Not provided"}</p>
                                </div>
                                {user.date_of_birth && (
                                  <div>
                                    <label className="font-medium text-gray-600">Date of Birth</label>
                                    <p>{new Date(user.date_of_birth).toLocaleDateString()}</p>
                                  </div>
                                )}
                              </div>
                            </Card>

                            {/* Account Details */}
                            <Card className="p-4">
                              <h3 className="font-semibold mb-3">Account Details</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <label className="font-medium text-gray-600">Account Type</label>
                                  <p className="capitalize">{user.person.replace('_', ' ')}</p>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-600">Plan</label>
                                  <p className="capitalize">{user.plan.replace('_', ' ')}</p>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-600">Credits</label>
                                  <p>{user.credits}</p>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-600">Admin Status</label>
                                  <p>{user.is_admin ? "Yes" : "No"}</p>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-600">Profile Status</label>
                                  <p>{user.profile_completed ? "Complete" : "Incomplete"}</p>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-600">Created</label>
                                  <p>{new Date(user.created_at).toLocaleDateString()}</p>
                                </div>
                                {user.trial_ends_at && (
                                  <div className="col-span-2">
                                    <label className="font-medium text-gray-600">Trial Ends</label>
                                    <p>{new Date(user.trial_ends_at).toLocaleDateString()}</p>
                                  </div>
                                )}
                              </div>
                            </Card>

                            {/* CV Information */}
                            {user.cv_data && (
                              <Card className="p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  CV Information
                                </h3>
                                <div className="space-y-3 text-sm">
                                  {user.cv_data.name && (
                                    <div>
                                      <label className="font-medium text-gray-600">CV Name</label>
                                      <p>{user.cv_data.name}</p>
                                    </div>
                                  )}
                                  {user.cv_data.summary && (
                                    <div>
                                      <label className="font-medium text-gray-600">Summary</label>
                                      <p className="text-gray-700">{user.cv_data.summary.substring(0, 200)}...</p>
                                    </div>
                                  )}
                                  {user.cv_data.skills && user.cv_data.skills.length > 0 && (
                                    <div>
                                      <label className="font-medium text-gray-600">Skills</label>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {user.cv_data.skills.slice(0, 10).map((skill: string, index: number) => (
                                          <Badge key={index} variant="secondary" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <label className="font-medium text-gray-600">CV Status</label>
                                    <p>{user.cv_data.validation_status || "processed"}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium text-gray-600">Upload Date</label>
                                    <p>{new Date(user.cv_data.created_at || user.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </Card>
                            )}

                            {/* CV Action in User Details Modal */}
                            {(user.cv_id || user.cv_data) && (
                              <Card className="p-4 bg-green-50 border-green-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    <div>
                                      <span className="font-semibold text-green-800 block">CV Available</span>
                                      <span className="text-sm text-green-600">View details or download CV file</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleViewCV(user)}
                                      disabled={loadingCV === user.user_id}
                                      variant="outline"
                                      className="gap-1 border-green-600 text-green-600 hover:bg-green-50"
                                    >
                                      {loadingCV === user.user_id ? (
                                        <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Eye className="h-3 w-3" />
                                      )}
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleDownloadCV(user)}
                                      disabled={downloadingCV === user.user_id}
                                      className="bg-green-600 hover:bg-green-700 gap-1"
                                    >
                                      {downloadingCV === user.user_id ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Download className="h-3 w-3" />
                                      )}
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Enhanced View CV Button */}
                      {(user.cv_id || user.cv_data) ? (
                        <Button
                          size="sm"
                          onClick={() => handleViewCV(user)}
                          disabled={loadingCV === user.user_id}
                          className="gap-1 bg-green-600 hover:bg-green-700 text-white min-w-[80px]"
                        >
                          {loadingCV === user.user_id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FileText className="h-3 w-3" />
                          )}
                          View CV
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="gap-1 bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed min-w-[80px]"
                        >
                          <AlertCircle className="h-3 w-3" />
                          No CV
                        </Button>
                      )}

                      {/* ✅ NEW: Download CV Button */}
                      {(user.cv_id || user.cv_data) && (
                        <Button
                          size="sm"
                          onClick={() => handleDownloadCV(user)}
                          disabled={downloadingCV === user.user_id}
                          variant="outline"
                          className="gap-1 border-blue-600 text-blue-600 hover:bg-blue-50 min-w-[90px]"
                        >
                          {downloadingCV === user.user_id ? (
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          Download
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Enhanced CV Viewing Modal */}
      <Dialog open={cvModalOpen} onOpenChange={setCvModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CV Details - {selectedCV?.user_info?.name || selectedCV?.user_info?.email || 'User'}
              </div>
              <div className="flex gap-2">
                {/* ✅ NEW: Download button in CV modal */}
                {selectedCV?.user_info?.cv_id && (
                  <Button
                    size="sm"
                    onClick={() => handleDownloadCV(selectedCV.user_info)}
                    disabled={downloadingCV === selectedCV?.user_info?.user_id}
                    className="gap-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {downloadingCV === selectedCV?.user_info?.user_id ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    Download
                  </Button>
                )}
                {selectedCV?.file_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(selectedCV.file_url, '_blank')}
                    className="gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open File
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedCV && (
            <div className="space-y-6">
              {/* CV Basic Info */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-3 text-blue-800">CV Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-blue-600">File Name</label>
                    <p className="font-medium">{selectedCV.file_name || "Unknown"}</p>
                  </div>
                  <div>
                    <label className="font-medium text-blue-600">Status</label>
                    <Badge variant={selectedCV.validation_status === "valid" ? "default" : "secondary"}>
                      {selectedCV.validation_status || "processed"}
                    </Badge>
                  </div>
                  <div>
                    <label className="font-medium text-blue-600">Upload Date</label>
                    <p>{selectedCV.created_at ? new Date(selectedCV.created_at).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-blue-600">File Type</label>
                    <p>{selectedCV.is_docx ? "DOCX Document" : "PDF Document"}</p>
                  </div>
                </div>
              </Card>

              {/* Parsed CV Data */}
              {selectedCV.parsed && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Parsed CV Content</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {selectedCV.parsed.name && (
                        <div>
                          <label className="font-medium text-gray-600">Name</label>
                          <p className="font-medium text-lg">{selectedCV.parsed.name}</p>
                        </div>
                      )}
                      {selectedCV.parsed.email && (
                        <div>
                          <label className="font-medium text-gray-600">Email</label>
                          <p>{selectedCV.parsed.email}</p>
                        </div>
                      )}
                      {selectedCV.parsed.phone && (
                        <div>
                          <label className="font-medium text-gray-600">Phone</label>
                          <p>{selectedCV.parsed.phone}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      {selectedCV.parsed.summary && (
                        <div>
                          <label className="font-medium text-gray-600">Professional Summary</label>
                          <p className="text-gray-700 leading-relaxed">{selectedCV.parsed.summary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Skills */}
              {selectedCV.skills && selectedCV.skills.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Skills ({selectedCV.skills.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCV.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Experience & Education */}
              <div className="grid md:grid-cols-2 gap-6">
                {selectedCV.parsed?.experience && selectedCV.parsed.experience.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Experience</h3>
                    <div className="space-y-4">
                      {selectedCV.parsed.experience.map((exp: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                          <div className="font-medium text-lg">{exp.title || exp.position}</div>
                          <div className="text-blue-600 font-medium">{exp.company}</div>
                          <div className="text-sm text-gray-500">
                            {exp.start_date || exp.from_year} - {exp.end_date || exp.to_year || "Present"}
                          </div>
                          {exp.description && (
                            <div className="text-sm text-gray-700 mt-1">{exp.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {selectedCV.parsed?.education && selectedCV.parsed.education.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Education</h3>
                    <div className="space-y-4">
                      {selectedCV.parsed.education.map((edu: any, index: number) => (
                        <div key={index} className="border-l-4 border-green-200 pl-4 py-2">
                          <div className="font-medium">{edu.degree}</div>
                          <div className="text-green-600 font-medium">{edu.institution}</div>
                          <div className="text-sm text-gray-500">{edu.year}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setParams((p) => ({ ...p, page: Math.max(1, (p.page || 1) - 1) }));
              }}
            />
            <span className="px-3 text-sm">
              Page {params.page || 1} of {totalPages}
            </span>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setParams((p) => ({ ...p, page: Math.min(totalPages, (p.page || 1) + 1) }));
              }}
            />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default AdminUsers;
// import { useQuery } from "@tanstack/react-query";
// import { listUsers, ListUsersParams, getUserCV } from "@/services/adminApi";
// import { useEffect, useMemo, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Card } from "@/components/ui/card";
// import { Pagination, PaginationContent, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Eye, FileText, User, Phone, MapPin, Briefcase, Calendar, Flag, Download, ExternalLink, AlertCircle } from "lucide-react";
// import { toast } from "sonner";

// // Enhanced types
// interface CVData {
//   id: string;
//   name?: string;
//   summary?: string;
//   skills?: string[];
//   validation_status?: string;
//   created_at?: string;
//   file_path?: string;
// }

// interface AdminUserRow {
//   user_id: string;
//   email: string;
//   name?: string;
//   person: string;
//   plan: string;
//   credits: number;
//   is_admin: boolean;
//   trial_ends_at?: string;
//   created_at: string;
//   phone?: string;
//   nationality?: string;
//   profession?: string;
//   date_of_birth?: string;
//   location?: string;
//   bio?: string;
//   linkedin_url?: string;
//   years_experience?: number;
//   education_level?: string;
//   cv_id?: string;
//   profile_completed?: boolean;
//   cv_data?: CVData;
// }

// const AdminUsers = () => {
//   const [params, setParams] = useState<ListUsersParams>({ page: 1, limit: 25 });
//   const [searchInput, setSearchInput] = useState<string>("");
//   const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
//   const [cvModalOpen, setCvModalOpen] = useState(false);
//   const [selectedCV, setSelectedCV] = useState<any>(null);
//   const [loadingCV, setLoadingCV] = useState<string | null>(null); // Track which CV is loading

//   // Debounce search input into params.search
//   useEffect(() => {
//     const id = window.setTimeout(() => {
//       setParams((p) => ({ ...p, page: 1, search: searchInput || undefined }));
//     }, 400);
//     return () => window.clearTimeout(id);
//   }, [searchInput]);

//   const query = useQuery({
//     queryKey: ["admin-users", params],
//     queryFn: () => listUsers(params),
//   });

//   const totalPages = useMemo(() => query.data?.total_pages || 1, [query.data]);

//   const handleViewDetails = async (user: AdminUserRow) => {
//     setSelectedUser(user);
//   };

//   const handleViewCV = async (user: AdminUserRow) => {
//     if (!user.cv_id) {
//       toast.error("User has no CV uploaded");
//       return;
//     }

//     setLoadingCV(user.user_id);
//     try {
//       const cvData = await getUserCV(user.cv_id);
//       setSelectedCV({ ...cvData, user_info: user });
//       setCvModalOpen(true);
//       toast.success("CV loaded successfully");
//     } catch (error: any) {
//       console.error("Failed to load CV:", error);
//       toast.error(`Failed to load CV: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setLoadingCV(null);
//     }
//   };

//   const getStatusBadge = (user: AdminUserRow) => {
//     if (user.profile_completed) {
//       return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
//     }
//     return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Incomplete</Badge>;
//   };

//   const getTrialStatus = (user: AdminUserRow) => {
//     if (user.plan === "free_trial") {
//       if (!user.trial_ends_at) {
//         return <Badge variant="outline" className="text-blue-600">Trial</Badge>;
//       }
      
//       const trialEnds = new Date(user.trial_ends_at);
//       const now = new Date();
//       const daysLeft = Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
//       if (daysLeft > 0) {
//         return <Badge variant="outline" className="text-blue-600">{daysLeft}d left</Badge>;
//       } else {
//         return <Badge variant="destructive">Expired</Badge>;
//       }
//     }
//     return <Badge variant="default" className="bg-purple-100 text-purple-800">Paid</Badge>;
//   };

//   const getCVStatusIndicator = (user: AdminUserRow) => {
//     if (user.cv_id || user.cv_data) {
//       return (
//         <div className="flex items-center gap-1 text-sm text-green-600">
//           <FileText className="h-3 w-3" />
//           <span className="font-medium">CV Available</span>
//         </div>
//       );
//     }
//     return (
//       <div className="flex items-center gap-1 text-sm text-gray-400">
//         <AlertCircle className="h-3 w-3" />
//         <span>No CV</span>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Users Management</h1>
//         <div className="text-sm text-gray-600">
//           {query.data?.total || 0} users total
//         </div>
//       </div>

//       {/* Enhanced Filters */}
//       <Card className="p-4">
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
//           <Input
//             placeholder="Search by email, name, or phone"
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             className="md:col-span-2"
//           />
//           <Select onValueChange={(v) => setParams((p) => ({ ...p, page: 1, plan: v === "all" ? undefined : v }))}>
//             <SelectTrigger><SelectValue placeholder="Filter by plan" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Plans</SelectItem>
//               <SelectItem value="free_trial">Free Trial</SelectItem>
//               <SelectItem value="pro">Pro</SelectItem>
//               <SelectItem value="premium">Premium</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select onValueChange={(v) => setParams((p) => ({ ...p, page: 1, person: v === "all" ? undefined : v }))}>
//             <SelectTrigger><SelectValue placeholder="Filter by type" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Types</SelectItem>
//               <SelectItem value="job_seeker">Job Seeker</SelectItem>
//               <SelectItem value="recruiter">Recruiter</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select onValueChange={(v) => setParams((p) => ({ ...p, page: 1, limit: Number(v) }))}>
//             <SelectTrigger><SelectValue placeholder="Page size" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="10">10</SelectItem>
//               <SelectItem value="25">25</SelectItem>
//               <SelectItem value="50">50</SelectItem>
//               <SelectItem value="100">100</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </Card>

//       {query.isError && (
//         <Card className="p-4 border-red-200 bg-red-50 text-red-700">
//           <div className="flex items-center justify-between">
//             <span className="text-sm">Failed to load users. Please try again.</span>
//             <Button size="sm" onClick={() => query.refetch()}>Retry</Button>
//           </div>
//         </Card>
//       )}

//       {/* Enhanced Users Table */}
//       <Card className="p-0 overflow-hidden">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-gray-50">
//                 <TableHead className="w-[250px]">User Info</TableHead>
//                 <TableHead>Contact</TableHead>
//                 <TableHead>Professional</TableHead>
//                 <TableHead>Account</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>CV Status</TableHead>
//                 <TableHead>Created</TableHead>
//                 <TableHead className="text-center">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {query.isLoading && (
//                 <>
//                   {Array.from({ length: 8 }).map((_, i) => (
//                     <TableRow key={`skeleton-${i}`}>
//                       {Array.from({ length: 8 }).map((_, j) => (
//                         <TableCell key={j}>
//                           <div className="h-4 w-full bg-muted animate-pulse rounded" />
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))}
//                 </>
//               )}
//               {!query.isLoading && query.data?.users?.map((user: AdminUserRow) => (
//                 <TableRow key={user.user_id} className="hover:bg-gray-50">
//                   <TableCell>
//                     <div className="space-y-1">
//                       <div className="flex items-center gap-2">
//                         <User className="h-4 w-4 text-gray-400" />
//                         <div>
//                           <div className="font-medium">{user.name || "No name"}</div>
//                           <div className="text-sm text-gray-500">{user.email}</div>
//                         </div>
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="space-y-1">
//                       {user.phone && (
//                         <div className="flex items-center gap-1 text-sm">
//                           <Phone className="h-3 w-3 text-gray-400" />
//                           {user.phone}
//                         </div>
//                       )}
//                       {user.location && (
//                         <div className="flex items-center gap-1 text-sm text-gray-500">
//                           <MapPin className="h-3 w-3 text-gray-400" />
//                           {user.location}
//                         </div>
//                       )}
//                       {user.nationality && (
//                         <div className="flex items-center gap-1 text-sm text-gray-500">
//                           <Flag className="h-3 w-3 text-gray-400" />
//                           {user.nationality}
//                         </div>
//                       )}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="space-y-1">
//                       {user.profession && (
//                         <div className="flex items-center gap-1 text-sm">
//                           <Briefcase className="h-3 w-3 text-gray-400" />
//                           {user.profession}
//                         </div>
//                       )}
//                       {user.date_of_birth && (
//                         <div className="flex items-center gap-1 text-sm text-gray-500">
//                           <Calendar className="h-3 w-3 text-gray-400" />
//                           {new Date(user.date_of_birth).getFullYear()}
//                         </div>
//                       )}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2">
//                         <Badge variant={user.person === "recruiter" ? "default" : "secondary"}>
//                           {user.person === "job_seeker" ? "Job Seeker" : "Recruiter"}
//                         </Badge>
//                       </div>
//                       <div className="text-sm">
//                         <span className="font-medium">{user.plan}</span>
//                         <span className="mx-2">•</span>
//                         <span className="text-gray-500">{user.credits} credits</span>
//                       </div>
//                       {getTrialStatus(user)}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="space-y-1">
//                       {getStatusBadge(user)}
//                       {user.is_admin && (
//                         <Badge variant="destructive" className="block w-fit">Admin</Badge>
//                       )}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     {getCVStatusIndicator(user)}
//                   </TableCell>
//                   <TableCell className="text-sm text-gray-500">
//                     {new Date(user.created_at).toLocaleDateString()}
//                   </TableCell>
//                   <TableCell className="text-center">
//                     <div className="flex items-center gap-2 justify-center">
//                       {/* View Details Button */}
//                       <Dialog>
//                         <DialogTrigger asChild>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => handleViewDetails(user)}
//                             className="gap-1 min-w-[70px]"
//                           >
//                             <Eye className="h-3 w-3" />
//                             Details
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
//                           <DialogHeader>
//                             <DialogTitle className="flex items-center gap-2">
//                               <User className="h-5 w-5" />
//                               {user.name || user.email.split('@')[0]} - User Details
//                             </DialogTitle>
//                           </DialogHeader>
                          
//                           <div className="space-y-6">
//                             {/* User Overview */}
//                             <Card className="p-4">
//                               <h3 className="font-semibold mb-3">User Information</h3>
//                               <div className="grid grid-cols-2 gap-4 text-sm">
//                                 <div>
//                                   <label className="font-medium text-gray-600">Full Name</label>
//                                   <p>{user.name || "Not provided"}</p>
//                                 </div>
//                                 <div>
//                                   <label className="font-medium text-gray-600">Email</label>
//                                   <p>{user.email}</p>
//                                 </div>
//                                 <div>
//                                   <label className="font-medium text-gray-600">Phone</label>
//                                   <p>{user.phone || "Not provided"}</p>
//                                 </div>
//                                 <div>
//                                   <label className="font-medium text-gray-600">Nationality</label>
//                                   <p>{user.nationality || "Not provided"}</p>
//                                 </div>
//                                 <div>
//                                   <label className="font-medium text-gray-600">Profession</label>
//                                   <p>{user.profession || "Not provided"}</p>
//                                 </div>
//                                 <div>
//                                   <label className="font-medium text-gray-600">Location</label>
//                                   <p>{user.location || "Not provided"}</p>
//                                 </div>
//                                 {user.date_of_birth && (
//                                   <div>
//                                     <label className="font-medium text-gray-600">Date of Birth</label>
//                                     <p>{new Date(user.date_of_birth).toLocaleDateString()}</p>
//                                   </div>
//                                 )}
//                               </div>
//                             </Card>

//                             {/* Account Details */}
//                             <Card className="p-4">
//                               <h3 className="font-semibold mb-3">Account Details</h3>
//                               <div className="grid grid-cols-2 gap-4 text-sm">
//                                 <div>
//                                   <label className="font-medium text-gray-600">Account Type</label>
//                                   <p className="capitalize">{user.person.replace('_', ' ')}</p>
//                                 </div>
//                                 <div>
//                                   <label className="font-medium text-gray-600">Plan</label>
//                                   <p className="capitalize">{user.plan.replace('_', ' ')}</p>
//                                 </div>
//                                 <div>
//                                   <label className="font-medium text-gray-600">Credits</label>
//                                   <p>{user.credits}</p>
//                                 </div>
//                                 <div>
//                                   <label className="font-medium text-gray-600">Admin Status</label>
//                                   <p>{user.is_admin ? "Yes" : "No"}</p>
//                                 </div>
//                                 <div>
//                                   <label className="font-medium text-gray-600">Profile Status</label>
//                                   <p>{user.profile_completed ? "Complete" : "Incomplete"}</p>
//                                 </div>
//                                 <div>
//                                   <label className="font-medium text-gray-600">Created</label>
//                                   <p>{new Date(user.created_at).toLocaleDateString()}</p>
//                                 </div>
//                                 {user.trial_ends_at && (
//                                   <div className="col-span-2">
//                                     <label className="font-medium text-gray-600">Trial Ends</label>
//                                     <p>{new Date(user.trial_ends_at).toLocaleDateString()}</p>
//                                   </div>
//                                 )}
//                               </div>
//                             </Card>

//                             {/* CV Information */}
//                             {user.cv_data && (
//                               <Card className="p-4">
//                                 <h3 className="font-semibold mb-3 flex items-center gap-2">
//                                   <FileText className="h-4 w-4" />
//                                   CV Information
//                                 </h3>
//                                 <div className="space-y-3 text-sm">
//                                   {user.cv_data.name && (
//                                     <div>
//                                       <label className="font-medium text-gray-600">CV Name</label>
//                                       <p>{user.cv_data.name}</p>
//                                     </div>
//                                   )}
//                                   {user.cv_data.summary && (
//                                     <div>
//                                       <label className="font-medium text-gray-600">Summary</label>
//                                       <p className="text-gray-700">{user.cv_data.summary.substring(0, 200)}...</p>
//                                     </div>
//                                   )}
//                                   {user.cv_data.skills && user.cv_data.skills.length > 0 && (
//                                     <div>
//                                       <label className="font-medium text-gray-600">Skills</label>
//                                       <div className="flex flex-wrap gap-1 mt-1">
//                                         {user.cv_data.skills.slice(0, 10).map((skill: string, index: number) => (
//                                           <Badge key={index} variant="secondary" className="text-xs">
//                                             {skill}
//                                           </Badge>
//                                         ))}
//                                       </div>
//                                     </div>
//                                   )}
//                                   <div>
//                                     <label className="font-medium text-gray-600">CV Status</label>
//                                     <p>{user.cv_data.validation_status || "processed"}</p>
//                                   </div>
//                                   <div>
//                                     <label className="font-medium text-gray-600">Upload Date</label>
//                                     <p>{new Date(user.cv_data.created_at || user.created_at).toLocaleDateString()}</p>
//                                   </div>
//                                 </div>
//                               </Card>
//                             )}

//                             {/* CV Action in User Details Modal */}
//                             {(user.cv_id || user.cv_data) && (
//                               <Card className="p-4 bg-green-50 border-green-200">
//                                 <div className="flex items-center justify-between">
//                                   <div className="flex items-center gap-2">
//                                     <FileText className="h-5 w-5 text-green-600" />
//                                     <div>
//                                       <span className="font-semibold text-green-800 block">CV Available</span>
//                                       <span className="text-sm text-green-600">Click to view full CV details</span>
//                                     </div>
//                                   </div>
//                                   <Button
//                                     size="sm"
//                                     onClick={() => handleViewCV(user)}
//                                     disabled={loadingCV === user.user_id}
//                                     className="bg-green-600 hover:bg-green-700 gap-1"
//                                   >
//                                     {loadingCV === user.user_id ? (
//                                       <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                     ) : (
//                                       <Eye className="h-3 w-3" />
//                                     )}
//                                     View Full CV
//                                   </Button>
//                                 </div>
//                               </Card>
//                             )}
//                           </div>
//                         </DialogContent>
//                       </Dialog>

//                       {/* Enhanced View CV Button */}
//                       {(user.cv_id || user.cv_data) ? (
//                         <Button
//                           size="sm"
//                           onClick={() => handleViewCV(user)}
//                           disabled={loadingCV === user.user_id}
//                           className="gap-1 bg-green-600 hover:bg-green-700 text-white min-w-[80px]"
//                         >
//                           {loadingCV === user.user_id ? (
//                             <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                           ) : (
//                             <FileText className="h-3 w-3" />
//                           )}
//                           View CV
//                         </Button>
//                       ) : (
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           disabled
//                           className="gap-1 bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed min-w-[80px]"
//                         >
//                           <AlertCircle className="h-3 w-3" />
//                           No CV
//                         </Button>
//                       )}
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </Card>

//       {/* Enhanced CV Viewing Modal */}
//       <Dialog open={cvModalOpen} onOpenChange={setCvModalOpen}>
//         <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <FileText className="h-5 w-5" />
//                 CV Details - {selectedCV?.user_info?.name || selectedCV?.user_info?.email || 'User'}
//               </div>
//               {selectedCV?.file_url && (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => window.open(selectedCV.file_url, '_blank')}
//                   className="gap-1"
//                 >
//                   <ExternalLink className="h-3 w-3" />
//                   Open File
//                 </Button>
//               )}
//             </DialogTitle>
//           </DialogHeader>
          
//           {selectedCV && (
//             <div className="space-y-6">
//               {/* CV Basic Info */}
//               <Card className="p-4 bg-blue-50 border-blue-200">
//                 <h3 className="font-semibold mb-3 text-blue-800">CV Information</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                   <div>
//                     <label className="font-medium text-blue-600">File Name</label>
//                     <p className="font-medium">{selectedCV.file_name || "Unknown"}</p>
//                   </div>
//                   <div>
//                     <label className="font-medium text-blue-600">Status</label>
//                     <Badge variant={selectedCV.validation_status === "valid" ? "default" : "secondary"}>
//                       {selectedCV.validation_status || "processed"}
//                     </Badge>
//                   </div>
//                   <div>
//                     <label className="font-medium text-blue-600">Upload Date</label>
//                     <p>{selectedCV.created_at ? new Date(selectedCV.created_at).toLocaleDateString() : 'Unknown'}</p>
//                   </div>
//                   <div>
//                     <label className="font-medium text-blue-600">File Type</label>
//                     <p>{selectedCV.is_docx ? "DOCX Document" : "PDF Document"}</p>
//                   </div>
//                 </div>
//               </Card>

//               {/* Parsed CV Data */}
//               {selectedCV.parsed && (
//                 <Card className="p-4">
//                   <h3 className="font-semibold mb-3">Parsed CV Content</h3>
//                   <div className="grid md:grid-cols-2 gap-6">
//                     <div className="space-y-4">
//                       {selectedCV.parsed.name && (
//                         <div>
//                           <label className="font-medium text-gray-600">Name</label>
//                           <p className="font-medium text-lg">{selectedCV.parsed.name}</p>
//                         </div>
//                       )}
//                       {selectedCV.parsed.email && (
//                         <div>
//                           <label className="font-medium text-gray-600">Email</label>
//                           <p>{selectedCV.parsed.email}</p>
//                         </div>
//                       )}
//                       {selectedCV.parsed.phone && (
//                         <div>
//                           <label className="font-medium text-gray-600">Phone</label>
//                           <p>{selectedCV.parsed.phone}</p>
//                         </div>
//                       )}
//                     </div>
//                     <div>
//                       {selectedCV.parsed.summary && (
//                         <div>
//                           <label className="font-medium text-gray-600">Professional Summary</label>
//                           <p className="text-gray-700 leading-relaxed">{selectedCV.parsed.summary}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </Card>
//               )}

//               {/* Skills */}
//               {selectedCV.skills && selectedCV.skills.length > 0 && (
//                 <Card className="p-4">
//                   <h3 className="font-semibold mb-3">Skills ({selectedCV.skills.length})</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedCV.skills.map((skill: string, index: number) => (
//                       <Badge key={index} variant="secondary" className="px-3 py-1">
//                         {skill}
//                       </Badge>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Experience & Education */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 {selectedCV.parsed?.experience && selectedCV.parsed.experience.length > 0 && (
//                   <Card className="p-4">
//                     <h3 className="font-semibold mb-3">Experience</h3>
//                     <div className="space-y-4">
//                       {selectedCV.parsed.experience.map((exp: any, index: number) => (
//                         <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
//                           <div className="font-medium text-lg">{exp.title || exp.position}</div>
//                           <div className="text-blue-600 font-medium">{exp.company}</div>
//                           <div className="text-sm text-gray-500">
//                             {exp.start_date || exp.from_year} - {exp.end_date || exp.to_year || "Present"}
//                           </div>
//                           {exp.description && (
//                             <div className="text-sm text-gray-700 mt-1">{exp.description}</div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </Card>
//                 )}

//                 {selectedCV.parsed?.education && selectedCV.parsed.education.length > 0 && (
//                   <Card className="p-4">
//                     <h3 className="font-semibold mb-3">Education</h3>
//                     <div className="space-y-4">
//                       {selectedCV.parsed.education.map((edu: any, index: number) => (
//                         <div key={index} className="border-l-4 border-green-200 pl-4 py-2">
//                           <div className="font-medium">{edu.degree}</div>
//                           <div className="text-green-600 font-medium">{edu.institution}</div>
//                           <div className="text-sm text-gray-500">{edu.year}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </Card>
//                 )}
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Pagination */}
//       <div className="flex justify-center">
//         <Pagination>
//           <PaginationContent>
//             <PaginationPrevious
//               href="#"
//               onClick={(e) => {
//                 e.preventDefault();
//                 setParams((p) => ({ ...p, page: Math.max(1, (p.page || 1) - 1) }));
//               }}
//             />
//             <span className="px-3 text-sm">
//               Page {params.page || 1} of {totalPages}
//             </span>
//             <PaginationNext
//               href="#"
//               onClick={(e) => {
//                 e.preventDefault();
//                 setParams((p) => ({ ...p, page: Math.min(totalPages, (p.page || 1) + 1) }));
//               }}
//             />
//           </PaginationContent>
//         </Pagination>
//       </div>
//     </div>
//   );
// };

// export default AdminUsers;
// import { useQuery } from "@tanstack/react-query";
// import { listUsers, ListUsersParams } from "@/services/adminApi";
// import { useEffect, useMemo, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Card } from "@/components/ui/card";
// import { Pagination, PaginationContent, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
// import { Button } from "@/components/ui/button";

// const AdminUsers = () => {
//   const [params, setParams] = useState<ListUsersParams>({ page: 1, limit: 25 });
//   const [searchInput, setSearchInput] = useState<string>("");

//   // Debounce search input into params.search
//   useEffect(() => {
//     const id = window.setTimeout(() => {
//       setParams((p) => ({ ...p, page: 1, search: searchInput || undefined }));
//     }, 400);
//     return () => window.clearTimeout(id);
//   }, [searchInput]);

//   const query = useQuery({
//     queryKey: ["admin-users", params],
//     queryFn: () => listUsers(params),
//   });

//   const totalPages = useMemo(() => query.data?.total_pages || 1, [query.data]);

//   return (
//     <div className="space-y-4">
//       <h1 className="text-xl font-semibold">Users</h1>

//       <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
//         <Input
//           placeholder="Search by email or name"
//           value={searchInput}
//           onChange={(e) => setSearchInput(e.target.value)}
//         />
//         <Select onValueChange={(v) => setParams((p) => ({ ...p, page: 1, plan: v || undefined }))}>
//           <SelectTrigger><SelectValue placeholder="Filter plan" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="free_trial">Free Trial</SelectItem>
//             <SelectItem value="pro">Pro</SelectItem>
//             <SelectItem value="premium">Premium</SelectItem>
//           </SelectContent>
//         </Select>
//         <Select onValueChange={(v) => setParams((p) => ({ ...p, page: 1, person: v || undefined }))}>
//           <SelectTrigger><SelectValue placeholder="Filter person" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="job_seeker">Job Seeker</SelectItem>
//             <SelectItem value="recruiter">Recruiter</SelectItem>
//           </SelectContent>
//         </Select>
//         <Select onValueChange={(v) => setParams((p) => ({ ...p, page: 1, limit: Number(v) }))}>
//           <SelectTrigger><SelectValue placeholder="Page size" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="10">10</SelectItem>
//             <SelectItem value="25">25</SelectItem>
//             <SelectItem value="50">50</SelectItem>
//             <SelectItem value="100">100</SelectItem>
//           </SelectContent>
//         </Select>
//       </Card>

//       {query.isError && (
//         <Card className="p-4 border-red-200 bg-red-50 text-red-700">
//           <div className="flex items-center justify-between">
//             <span className="text-sm">Failed to load users.</span>
//             <Button size="sm" onClick={() => query.refetch()}>Retry</Button>
//           </div>
//         </Card>
//       )}

//       <Card className="p-0 overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Email</TableHead>
//               <TableHead>Name</TableHead>
//               <TableHead>Person</TableHead>
//               <TableHead>Plan</TableHead>
//               <TableHead>Credits</TableHead>
//               <TableHead>Admin</TableHead>
//               <TableHead>Trial Ends</TableHead>
//               <TableHead>Created</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {query.isLoading && (
//               <>
//                 {Array.from({ length: 8 }).map((_, i) => (
//                   <TableRow key={`skeleton-${i}`}>
//                     <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
//                     <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
//                     <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
//                     <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
//                     <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
//                     <TableCell><div className="h-4 w-10 bg-muted animate-pulse rounded" /></TableCell>
//                     <TableCell><div className="h-4 w-28 bg-muted animate-pulse rounded" /></TableCell>
//                     <TableCell><div className="h-4 w-28 bg-muted animate-pulse rounded" /></TableCell>
//                   </TableRow>
//                 ))}
//               </>
//             )}
//             {!query.isLoading && query.data?.users?.map((u) => (
//               <TableRow key={u.user_id}>
//                 <TableCell>{u.email}</TableCell>
//                 <TableCell>{u.name}</TableCell>
//                 <TableCell>{u.person}</TableCell>
//                 <TableCell>{u.plan}</TableCell>
//                 <TableCell>{u.credits}</TableCell>
//                 <TableCell>{u.is_admin ? "Yes" : "No"}</TableCell>
//                 <TableCell>{u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString() : "—"}</TableCell>
//                 <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Card>

//       <div className="flex justify-center">
//         <Pagination>
//           <PaginationContent>
//             <PaginationPrevious
//               href="#"
//               onClick={(e) => {
//                 e.preventDefault();
//                 setParams((p) => ({ ...p, page: Math.max(1, (p.page || 1) - 1) }));
//               }}
//             />
//             <span className="px-3 text-sm">
//               Page {params.page || 1} of {totalPages}
//             </span>
//             <PaginationNext
//               href="#"
//               onClick={(e) => {
//                 e.preventDefault();
//                 setParams((p) => ({ ...p, page: Math.min(totalPages, (p.page || 1) + 1) }));
//               }}
//             />
//           </PaginationContent>
//         </Pagination>
//       </div>
//     </div>
//   );
// };

// export default AdminUsers;


