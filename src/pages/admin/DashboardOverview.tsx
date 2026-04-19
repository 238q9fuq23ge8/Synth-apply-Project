import { useQuery } from "@tanstack/react-query";
import { getOverviewMetrics, getUserMetrics } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardOverview = () => {
  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: getOverviewMetrics });
  const users = useQuery({ queryKey: ["admin-users-metrics"], queryFn: getUserMetrics });

  const growthData = users.data?.growth_data
    ? Object.entries(users.data.growth_data).map(([date, value]) => ({ date, value }))
    : [];

  const downloadPDF = () => {
    const content = `
      <html>
        <head>
          <title>Admin Dashboard Overview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
            .metric-card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; background: #f9fafb; }
            .metric-title { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
            .growth-section { margin-top: 30px; }
            .growth-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
            .timestamp { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
            .summary-stats { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Admin Dashboard Overview Report</h1>
            <p>Comprehensive platform analytics and metrics</p>
          </div>
          
          <div class="summary-stats">
            <h3>Executive Summary</h3>
            <p><strong>Total Users:</strong> ${overview.data?.total_users || 0} | 
               <strong>Revenue:</strong> $${overview.data?.total_revenue || 0} | 
               <strong>Growth:</strong> ${overview.data?.new_users_week || 0} new users this week</p>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">Total Users</div>
              <div class="metric-value">${overview.data?.total_users || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Paid Users</div>
              <div class="metric-value">${overview.data?.paid_users || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Active Trials</div>
              <div class="metric-value">${overview.data?.active_trials || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Total Applications</div>
              <div class="metric-value">${overview.data?.total_applications || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">New Users Today</div>
              <div class="metric-value">${overview.data?.new_users_today || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">New Users This Week</div>
              <div class="metric-value">${overview.data?.new_users_week || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">New Users This Month</div>
              <div class="metric-value">${overview.data?.new_users_month || 0}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Total Revenue</div>
              <div class="metric-value">$${overview.data?.total_revenue || 0}</div>
            </div>
          </div>

          <div class="growth-section">
            <div class="growth-title">User Breakdown</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div><strong>Job Seekers:</strong> ${users.data?.job_seekers || 0}</div>
              <div><strong>Recruiters:</strong> ${users.data?.recruiters || 0}</div>
              <div><strong>Trial Users:</strong> ${users.data?.trial_users || 0}</div>
              <div><strong>Users with CVs:</strong> ${users.data?.users_with_cvs || 0}</div>
            </div>
          </div>

          <div class="growth-section">
            <div class="growth-title">Platform Activity</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div><strong>Total Automations:</strong> ${overview.data?.total_automations || 0}</div>
              <div><strong>Avg CVs per User:</strong> ${users.data?.avg_cvs_per_user || 0}</div>
              <div><strong>Avg Applications per User:</strong> ${users.data?.avg_applications_per_user || 0}</div>
            </div>
          </div>

          <div class="timestamp">
            Report generated on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-overview-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (overview.isLoading || users.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">Loading overview…</div>
      </div>
    );
  }

  if (overview.isError || users.isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-sm text-red-600">Failed to load overview data.</div>
        <Button onClick={() => { overview.refetch(); users.refetch(); }}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin Overview</h1>
        <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download as PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Total Users" value={overview.data?.total_users} loading={overview.isLoading} />
        <Kpi title="Paid Users" value={overview.data?.paid_users} loading={overview.isLoading} />
        <Kpi title="Active Trials" value={overview.data?.active_trials} loading={overview.isLoading} />
        <Kpi title="Total Applications" value={overview.data?.total_applications} loading={overview.isLoading} />
      </div>

      <Card className="p-4">
        <h2 className="font-medium mb-2">User Growth (last 30 days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <XAxis dataKey="date" hide />
              <YAxis allowDecimals={false} width={30} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

const Kpi = ({ title, value, loading }: { title: string; value: number | undefined; loading: boolean }) => {
  return (
    <Card className="p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-semibold mt-1">{loading ? "—" : value ?? 0}</div>
    </Card>
  );
};

export default DashboardOverview;
// import { useQuery } from "@tanstack/react-query";
// import { getOverviewMetrics, getUserMetrics } from "@/services/adminApi";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const DashboardOverview = () => {
//   const overview = useQuery({ queryKey: ["admin-overview"], queryFn: getOverviewMetrics });
//   const users = useQuery({ queryKey: ["admin-users-metrics"], queryFn: getUserMetrics });

//   const growthData = users.data?.growth_data
//     ? Object.entries(users.data.growth_data).map(([date, value]) => ({ date, value }))
//     : [];

//   if (overview.isLoading || users.isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-sm text-muted-foreground">Loading overview…</div>
//       </div>
//     );
//   }

//   if (overview.isError || users.isError) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3">
//         <div className="text-sm text-red-600">Failed to load overview data.</div>
//         <Button onClick={() => { overview.refetch(); users.refetch(); }}>Retry</Button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-xl font-semibold">Admin Overview</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Kpi title="Total Users" value={overview.data?.total_users} loading={overview.isLoading} />
//         <Kpi title="Paid Users" value={overview.data?.paid_users} loading={overview.isLoading} />
//         <Kpi title="Active Trials" value={overview.data?.active_trials} loading={overview.isLoading} />
//         <Kpi title="Total Applications" value={overview.data?.total_applications} loading={overview.isLoading} />
//       </div>

//       <Card className="p-4">
//         <h2 className="font-medium mb-2">User Growth (last 30 days)</h2>
//         <div className="h-64">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={growthData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
//               <XAxis dataKey="date" hide />
//               <YAxis allowDecimals={false} width={30} />
//               <Tooltip />
//               <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </Card>
//     </div>
//   );
// };

// const Kpi = ({ title, value, loading }: { title: string; value: number | undefined; loading: boolean }) => {
//   return (
//     <Card className="p-4">
//       <div className="text-sm text-muted-foreground">{title}</div>
//       <div className="text-2xl font-semibold mt-1">{loading ? "—" : value ?? 0}</div>
//     </Card>
//   );
// };

// export default DashboardOverview;


