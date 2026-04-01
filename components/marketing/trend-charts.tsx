"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type { WeeklyTrend, ChannelMetrics } from "@/lib/marketing/types";

export function SpendVsLeadsChart({ data }: { data: WeeklyTrend[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Δαπάνη vs Leads (Εβδομαδιαία)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis yAxisId="spend" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `€${v}`} />
              <YAxis yAxisId="leads" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(value, name) => [
                  name === "spend" ? `€${Number(value).toLocaleString()}` : String(value),
                  name === "spend" ? "Δαπάνη" : "Leads",
                ]}
              />
              <Line yAxisId="spend" type="monotone" dataKey="spend" stroke="#1C4E89" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="leads" type="monotone" dataKey="leads" stroke="#7BCFB5" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CPLTrendChart({ data }: { data: WeeklyTrend[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">CPL Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `€${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(value) => [`€${Number(value).toFixed(1)}`, "CPL"]}
              />
              <Line type="monotone" dataKey="cpl" stroke="#F39257" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const COLORS = ["#1C4E89", "#00B1C9", "#7BCFB5"];

export function SpendDistributionChart({ data }: { data: ChannelMetrics[] }) {
  const pieData = data
    .filter((d) => d.spend > 0)
    .map((d) => ({ name: d.channel, value: d.spend }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Κατανομή Δαπάνης</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#94a3b8" }}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(value) => [`€${Number(value).toLocaleString()}`, "Δαπάνη"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
