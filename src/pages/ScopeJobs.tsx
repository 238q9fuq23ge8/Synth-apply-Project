
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import {
    BriefcaseBusiness,
    Loader2,
    X,
    CalendarDays,
    Sparkles,
    ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

type CJob = {
    id: string;
    title: string;
    description: string;
    skills: string[];
    created_at: string;
};

export default function ScopeJobs() {
    const [jobs, setJobs] = useState<CJob[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const load = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            // Trying public endpoint or fallback to company-jobs (might need auth adjustment on backend if 401)
            // Assuming /v1/company-jobs might be protected, but let's try. 
            // If it fails for public, we might need a specific public list endpoint. 
            // For now, mirroring CompanyJobs behavior.
            const res = await api.get("/v1/company-jobs", { params: { page: p } });
            const list: CJob[] = res.data?.jobs || [];
            setJobs(p === 1 ? list : (prev) => [...prev, ...list]);
            setPage(p);
        } catch (e: any) {
            console.error(e);
            // setMsg(e?.response?.data?.detail || "Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(1);
    }, [load]);


    const filtered = jobs.filter((j) =>
        (j.title + " " + j.description + " " + (j.skills || []).join(" ")).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-slate-50 flex-col">
            <main className="flex-1 p-6 md:p-8">
                <div className="mx-auto w-full max-w-6xl space-y-8">
                    {/* Back Button & Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/")}
                                className="h-12 w-12 p-0 rounded-xl shadow-sm hover:shadow-md transition-all"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md shadow-indigo-200/40">
                                    <BriefcaseBusiness className="h-6 w-6 text-white" />
                                    <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 via-indigo-700 to-slate-600 bg-clip-text text-transparent">
                                        Scope Jobs
                                    </h1>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Explore open opportunities and apply publicly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 rounded-2xl bg-white shadow-md p-6 border border-slate-100">
                        <Input
                            placeholder="Search by title, description, or skills..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="sm:flex-1 bg-slate-50 focus:bg-white transition-all h-11 text-base rounded-xl"
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => load(1)}
                                className="bg-white hover:bg-slate-50 text-slate-700 shadow-sm font-semibold"
                            >
                                Refresh
                            </Button>
                            <Button
                                onClick={() => setSearch("")}
                                variant="ghost"
                                className="font-semibold text-slate-600 hover:text-indigo-600"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    {/* Jobs Grid */}
                    <div className="grid gap-6">
                        {loading && page === 1 ? (
                            <div className="animate-pulse rounded-2xl bg-white py-24 text-center shadow-lg border border-slate-100">
                                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-500" />
                                <p className="text-slate-500 font-medium">Fetching opportunities...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="rounded-2xl bg-white py-20 text-center shadow-lg border border-slate-100">
                                <BriefcaseBusiness className="mx-auto h-14 w-14 text-slate-300 mb-3" />
                                <p className="text-lg font-semibold text-slate-600">No jobs found</p>
                                <p className="text-sm text-slate-400">Try adjusting your search filters</p>
                            </div>
                        ) : (
                            filtered.map((j) => (
                                <div
                                    key={j.id}
                                    className="group rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 p-8 hover:-translate-y-1 cursor-pointer"
                                    onClick={() => navigate(`/job/${j.id}`)}
                                >
                                    <div className="flex justify-between items-start gap-6">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {j.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                                {j.description}
                                            </p>
                                            {j.skills?.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {j.skills.slice(0, 10).map((s) => (
                                                        <span
                                                            key={s}
                                                            className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1.5 text-xs font-semibold shadow-sm"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                Posted {new Date(j.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-semibold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/job/${j.id}`);
                                                }}
                                            >
                                                Apply Publicly
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-10">
                        <Button
                            variant="outline"
                            onClick={() => load(page + 1)}
                            disabled={loading}
                            className="h-12 min-w-[200px] bg-white border border-slate-200 shadow-md hover:shadow-lg font-semibold"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                                </>
                            ) : (
                                "Load More Jobs"
                            )}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
