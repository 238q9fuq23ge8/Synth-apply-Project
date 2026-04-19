import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRevenueMetrics } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";

const AdminRevenue = () => {
  const revenue = useQuery({ queryKey: ["admin-revenue"], queryFn: getRevenueMetrics });

  const packageData = useMemo(() => {
    if (!revenue.data?.revenue_by_package) return [] as { name: string; count: number; revenue: number }[];
    return Object.entries(revenue.data.revenue_by_package).map(([name, v]) => ({ name, count: v.count, revenue: v.revenue }));
  }, [revenue.data]);

  if (revenue.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">Loading revenue…</div>
      </div>
    );
  }

  if (revenue.isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-sm text-red-600">Failed to load revenue.</div>
        <Button onClick={() => revenue.refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Revenue</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Total Revenue" value={fmtCurrency(revenue.data?.total_revenue)} loading={revenue.isLoading} />
        <Kpi title="Today" value={fmtCurrency(revenue.data?.revenue_today)} loading={revenue.isLoading} />
        <Kpi title="This Week" value={fmtCurrency(revenue.data?.revenue_week)} loading={revenue.isLoading} />
        <Kpi title="This Month" value={fmtCurrency(revenue.data?.revenue_month)} loading={revenue.isLoading} />
      </div>

      <Card className="p-4">
        <h2 className="font-medium mb-2">Revenue by Package</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={packageData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">ARPU</div>
        <div className="text-2xl font-semibold mt-1">{revenue.isLoading ? "—" : revenue.data?.arpu ?? 0}</div>
      </Card>
    </div>
  );
};

const Kpi = ({ title, value, loading }: { title: string; value: string; loading: boolean }) => (
  <Card className="p-4">
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="text-2xl font-semibold mt-1">{loading ? "—" : value}</div>
  </Card>
);

function fmtCurrency(v?: number) {
  if (v == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
  } catch {
    return `$${v.toFixed(2)}`;
  }
}

export default AdminRevenue;


