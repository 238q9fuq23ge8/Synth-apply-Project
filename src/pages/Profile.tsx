import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Archive,
  User,
  CreditCard,
  LogOut,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
        active ? "bg-[#eef4ff] text-[#2563eb]" : "text-[#374151] hover:bg-[#f3f4f6]"
      )}
    >
      <span
        className={cn(
          "w-5 h-5 rounded-full grid place-items-center",
          active ? "bg-[#2563eb] text-white" : "bg-[#eff2f8] text-[#2563eb]"
        )}
      >
        <Icon className="w-3 h-3" />
      </span>
      {label}
    </button>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const role = (localStorage.getItem("person") as "recruiter" | "job_seeker") || "job_seeker";
  const userRaw = localStorage.getItem("user");
  const userObj = userRaw ? JSON.parse(userRaw) : null;
  const authProvider = userObj?.app_metadata?.provider || userObj?.identities?.[0]?.provider || null;
  const displayName = userObj?.user_metadata?.name || userObj?.email?.split("@")[0] || "Profile";

  useEffect(() => {
    // Seed immediately from localStorage so form is never blank
    const userRaw = localStorage.getItem("user");
    const userObj = userRaw ? JSON.parse(userRaw) : null;
    if (userObj) {
      const meta = userObj.user_metadata || {};
      setName(meta.name || meta.full_name || "");
      setEmail(userObj.email || "");
      setPhone(meta.phone || "");
      setNationality(meta.nationality || "");
      setDob(meta.date_of_birth || "");
      setLocation(meta.location || "");
      setCompanyName(meta.company_name || "");
    }

    // Fetch latest from backend using GET /v1/profile/{user_id}
    const fetchProfile = async () => {
      try {
        const userRaw = localStorage.getItem("user");
        const userObj = userRaw ? JSON.parse(userRaw) : null;
        if (!userObj?.id) return;
        const res = await api.get(`/v1/profile/${userObj.id}`);
        const profile = res.data;
        if (profile.name || profile.full_name) setName(profile.name || profile.full_name);
        if (profile.email) setEmail(profile.email);
        if (profile.phone) setPhone(profile.phone);
        if (profile.nationality) setNationality(profile.nationality);
        if (profile.date_of_birth) setDob(profile.date_of_birth);
        if (profile.location) setLocation(profile.location);
        if (profile.company_name) setCompanyName(profile.company_name);
      } catch (err) {
        // silently ignore — form already seeded from localStorage
      }
    };
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const userRaw = localStorage.getItem("user");
      const userObj = userRaw ? JSON.parse(userRaw) : null;

      // Build updated user object matching what /v1/profile/sync expects
      const updatedUser = {
        ...(userObj || {}),
        user_metadata: {
          ...(userObj?.user_metadata || {}),
          name,
          phone,
          nationality,
          date_of_birth: dob || null,
          location: location || null,
          company_name: companyName || null,
        },
      };

      await api.post("/v1/profile/sync", { user: updatedUser });

      // Upload logo separately if a file was selected (recruiter only)
      if (companyLogo && role === "recruiter") {
        const formData = new FormData();
        formData.append("file", companyLogo);
        await api.post("/v1/recruiter/upload-logo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Persist locally
      if (userObj) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setShowSavedModal(true);
      toast.success("Profile Saved Successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.detail || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    setChangingPassword(true);
    try {
      await api.post("/v1/auth/password-update", {
        token: null, // uses session token from api.ts interceptor
        password: newPassword,
      });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      return;
    }
    try {
      await api.delete("/v1/auth/account");
      toast.success("Account deleted successfully");
      logout();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete account");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  if (role !== "recruiter") {
    return (
      <MainLayout>
      <div className="min-h-[calc(100vh-72px)] bg-[#f7f8fb] px-4 md:px-6 xl:px-8 py-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-[40px] leading-none font-bold text-[#2563eb] mb-2">Profile</h1>
              <p className="text-[12px] text-[#6b7280] font-medium">
                Manage Your Personal Information, And Keep Your Account Details Up To Date.
              </p>
            </div>
          </div>

          <section className="rounded-lg border border-[#eceef3] bg-white p-4 md:p-5">
            <h3 className="text-[22px] font-semibold text-[#111827] mb-4">Account Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 pl-9 border-[#e5e7eb]" placeholder="Enter Your Name" />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={email} disabled className="h-10 pl-9 border-[#e5e7eb] bg-[#fafafa]" />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 pl-9 border-[#e5e7eb]" placeholder="Enter Your Number" />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Nationality</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={nationality} onChange={(e) => setNationality(e.target.value)} className="h-10 pl-9 border-[#e5e7eb]" placeholder="Select Your Nationality" />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Date Of Birth (Optional)</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-10 pl-9 border-[#e5e7eb]" />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Current Location (Optional)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-10 pl-9 border-[#e5e7eb]" placeholder="Select Your Current Location" />
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end mt-4">
            <Button className="h-10 px-9 bg-[#2c64eb] hover:bg-[#2056d2] text-white font-semibold" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {showSavedModal && (
          <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
            <div className="relative w-full max-w-[420px] bg-white rounded-lg shadow-2xl border border-[#edf0f5] px-6 py-6">
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="absolute right-4 top-4 text-[#6b7280] hover:text-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-20 h-20 rounded-full bg-[#e9fbe8] mx-auto mb-4 grid place-items-center">
                <CheckCircle2 className="w-12 h-12 text-[#22c55e]" />
              </div>
              <h3 className="text-center text-[26px] leading-none font-semibold text-[#111827] mb-2">Profile Saved Successfully!</h3>
              <p className="text-center text-[13px] text-[#6b7280] font-medium mb-5">
                Your Information Is Up To Date. You're All Set To Continue.
              </p>
              <Button className="w-full h-11 bg-[#2b64eb] hover:bg-[#2056d2] text-white font-semibold" onClick={() => setShowSavedModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
      </MainLayout>
    );
  }

  return (
    <div className="bg-[#f7f8fb] min-h-screen">
      <div className="flex">
        <aside className="hidden lg:flex lg:flex-col lg:justify-between w-[220px] xl:w-[236px] shrink-0 border-r border-[#eceef3] bg-white sticky top-0 h-screen px-3 py-4">
          <div>
            <div className="flex items-center gap-2.5 px-2 mb-5 pt-1">
              <img src={ScopeLogo} alt="Scope AI" className="w-9 h-9 object-contain" />
              <span className="text-[30px] leading-none font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-fuchsia-500">
                Scope AI
              </span>
            </div>
            <div className="space-y-1.5">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate("/recruiter")} />
              <SidebarItem icon={BriefcaseBusiness} label="My Jobs" onClick={() => navigate("/recruiter/my-jobs")} />
              <SidebarItem icon={Users} label="Candidates" onClick={() => navigate("/recruiter/candidates")} />
              <SidebarItem icon={Archive} label="Archived Jobs" onClick={() => navigate("/recruiter-archived-jobs")} />
              <SidebarItem icon={User} label="Profile" active />
              <SidebarItem icon={CreditCard} label="Upgrade plan" onClick={() => navigate("/recruiter-plans")} />
            </div>
          </div>
          <SidebarItem icon={LogOut} label="Logout" onClick={logout} />
        </aside>

        <main className="flex-1 min-w-0 px-4 md:px-6 xl:px-8 py-5">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-[42px] leading-none font-bold text-[#2563eb] mb-2">Profile</h1>
                <p className="text-[12px] text-[#6b7280] font-medium">
                  Manage Your Personal Information, And Keep Your Account Details Up To Date.
                </p>
              </div>
            </div>
            <div className="flex justify-end mb-3">
              <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280] font-medium">
                {authProvider === "google" ? <span className="text-[14px]">G</span> : <User className="w-3.5 h-3.5" />}
                <span>{displayName}</span>
                <span>|</span>
                <span>Free Account</span>
              </div>
            </div>

            <section className="rounded-lg border border-[#eceef3] bg-white p-4 md:p-5">
              <h3 className="text-[24px] font-semibold text-[#111827] mb-4">Account Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 pl-9 border-[#e5e7eb]" placeholder="Enter Your Name" />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input value={email} disabled className="h-10 pl-9 border-[#e5e7eb] bg-[#fafafa]" />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 pl-9 border-[#e5e7eb]" placeholder="Enter Your Number" />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Nationality</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input value={nationality} onChange={(e) => setNationality(e.target.value)} className="h-10 pl-9 border-[#e5e7eb]" placeholder="Select Your Nationality" />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Date Of Birth (Optional)</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-10 pl-9 border-[#e5e7eb]" />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Current Location (Optional)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-10 pl-9 border-[#e5e7eb]" placeholder="Select Your Current Location" />
                  </div>
                </div>
              </div>

              <h3 className="text-[24px] font-semibold text-[#111827] mt-8 mb-4">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Company Logo *</label>
                  <div className="h-10 border border-[#e5e7eb] rounded-md px-3 flex items-center justify-between">
                    <span className="text-[12px] text-[#9ca3af] truncate">{companyLogo ? companyLogo.name : "PNG, JPG (Max 5MB)."}</span>
                    <label className="h-7 px-3 rounded bg-[#2c64eb] text-white text-[11px] font-semibold inline-flex items-center cursor-pointer">
                      + Choose File
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg"
                        onChange={(e) => setCompanyLogo(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Company Name *</label>
                  <div className="relative">
                    <BriefcaseBusiness className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-10 pl-9 border-[#e5e7eb]"
                      placeholder="Enter Company Name"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end mt-4">
              <Button className="h-10 px-9 bg-[#2c64eb] hover:bg-[#2056d2] text-white font-semibold" onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>

            <section className="mt-12 pt-12 border-t border-[#eceef3]">
              <h3 className="text-[24px] font-semibold text-[#111827] mb-6">Security & Account</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Change Password */}
                <div className="space-y-4">
                  <h4 className="text-[16px] font-bold text-[#374151]">Change Password</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">Old Password</label>
                      <Input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="h-10 border-[#e5e7eb]"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[#6b7280] mb-1 block">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-10 border-[#e5e7eb]"
                      />
                    </div>
                    <Button
                      className="w-full h-10 bg-white border border-[#2c64eb] text-[#2c64eb] hover:bg-blue-50 font-semibold"
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                    >
                      {changingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-4">
                  <h4 className="text-[16px] font-bold text-red-600">Danger Zone</h4>
                  <div className="p-4 rounded-xl border border-red-100 bg-red-50/30">
                    <p className="text-[13px] text-red-700 font-medium mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button
                      className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-semibold"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="relative w-full max-w-[420px] bg-white rounded-lg shadow-2xl border border-[#edf0f5] px-6 py-6">
            <button
              type="button"
              onClick={() => setShowSavedModal(false)}
              className="absolute right-4 top-4 text-[#6b7280] hover:text-[#111827]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-full bg-[#e9fbe8] mx-auto mb-4 grid place-items-center">
              <CheckCircle2 className="w-12 h-12 text-[#22c55e]" />
            </div>
            <h3 className="text-center text-[26px] leading-none font-semibold text-[#111827] mb-2">Profile Saved Successfully!</h3>
            <p className="text-center text-[13px] text-[#6b7280] font-medium mb-5">
              Your Information Is Up To Date. You're All Set To Continue.
            </p>

            <Button className="w-full h-11 bg-[#2b64eb] hover:bg-[#2056d2] text-white font-semibold" onClick={() => setShowSavedModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

