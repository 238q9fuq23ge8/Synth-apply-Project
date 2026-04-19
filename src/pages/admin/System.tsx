import { useQuery } from "@tanstack/react-query";
import { getSystemMetrics } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const AdminSystem = () => {
  const system = useQuery({ queryKey: ["admin-system"], queryFn: getSystemMetrics });

  if (system.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">Loading system metrics…</div>
      </div>
    );
  }

  if (system.isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-sm text-red-600">Failed to load system metrics.</div>
        <Button onClick={() => system.refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">System</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Credits Purchased" value={system.data?.total_credits_purchased} loading={system.isLoading} />
        <Kpi title="Credits Consumed" value={system.data?.total_credits_consumed} loading={system.isLoading} />
        <Kpi title="Credits Remaining" value={system.data?.credits_remaining} loading={system.isLoading} />
        <Kpi title="Automation Runs" value={system.data?.total_automation_runs} loading={system.isLoading} />
      </div>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Automation Success Rate</div>
        <div className="flex items-end justify-between mt-2">
          <div className="w-full mr-4">
            <Progress value={system.data?.automation_success_rate || 0} />
          </div>
          <div className="text-xl font-semibold">{system.isLoading ? "—" : `${system.data?.automation_success_rate ?? 0}%`}</div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi title="Successful Runs" value={system.data?.successful_runs} loading={system.isLoading} />
        <Kpi title="Failed Runs" value={system.data?.failed_runs} loading={system.isLoading} />
        <Kpi title="Total Applications" value={system.data?.total_applications} loading={system.isLoading} />
      </div>
    </div>
  );
};

const Kpi = ({ title, value, loading }: { title: string; value: number | undefined; loading: boolean }) => (
  <Card className="p-4">
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="text-2xl font-semibold mt-1">{loading ? "—" : value ?? 0}</div>
  </Card>
);

export default AdminSystem;