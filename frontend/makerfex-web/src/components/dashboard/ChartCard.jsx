// src/components/dashboard/ChartCard.jsx
import React from "react";
import ReactApexChart from "react-apexcharts";
import { DashboardCard } from "./DashboardCard";

export function ChartCard({
  title,
  chartType,
  options,
  series,
  isLoading,
  error,
}) {
  const safeOptions = options || {};
  const safeSeries = series || [];

  return (
    <DashboardCard title={title} isLoading={isLoading} error={error}>
      <div className="chart-card">
        {!isLoading && !error && (
          <ReactApexChart
            type={chartType || "bar"}
            options={safeOptions}
            series={safeSeries}
            height={260}
          />
        )}
      </div>
    </DashboardCard>
  );
}
