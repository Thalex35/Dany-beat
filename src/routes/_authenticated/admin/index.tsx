import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ErrorState, Skeleton } from "@/components/ui/states";
import { adminEventsDailyQuery, adminOverviewQuery } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverviewPage,
});

const STAT_LABELS: {
  key: keyof NonNullable<ReturnType<typeof useOverviewData>["data"]>;
  label: string;
}[] = [
  { key: "published_beats", label: "Published beats" },
  { key: "draft_beats", label: "Draft beats" },
  { key: "users", label: "Registered users" },
  { key: "active_users", label: "Active (30d)" },
  { key: "views", label: "Total views" },
  { key: "plays", label: "Total plays" },
  { key: "likes", label: "Total likes" },
  { key: "comments", label: "Total comments" },
  { key: "whatsapp", label: "WhatsApp clicks" },
];

function useOverviewData() {
  return useQuery(adminOverviewQuery);
}

function AdminOverviewPage() {
  const overview = useOverviewData();
  const daily = useQuery(adminEventsDailyQuery);

  const chartData = useMemo(() => {
    if (!daily.data) return [];
    const byDay = new Map<string, { day: string; views: number; plays: number }>();
    for (const row of daily.data) {
      const entry = byDay.get(row.day) ?? { day: row.day, views: 0, plays: 0 };
      if (row.event_type === "beat_view") entry.views += row.count;
      if (row.event_type === "beat_play") entry.plays += row.count;
      byDay.set(row.day, entry);
    }
    return Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [daily.data]);

  if (overview.isError) {
    return (
      <ErrorState
        description="Analytics could not be loaded — make sure your account has the admin role."
        onRetry={() => void overview.refetch()}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tighter">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide stats across the last 30 days and all time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {overview.isPending
          ? Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : STAT_LABELS.map((stat) => (
              <div key={stat.key} className="rounded-2xl bg-surface p-4 ring-1 ring-border">
                <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {overview.data![stat.key]}
                </p>
              </div>
            ))}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Views & plays — last 30 days</h2>
        <div className="mt-4 h-64 rounded-2xl bg-surface p-4 ring-1 ring-border">
          {daily.isPending ? (
            <Skeleton className="h-full w-full" />
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No activity recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="plays"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
