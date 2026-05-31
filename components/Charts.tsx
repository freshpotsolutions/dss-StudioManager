"use client";

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export function RevenueChart({ labels, data }: { labels: string[]; data: number[] }) {
  return (
    <Line
      height={150}
      data={{
        labels,
        datasets: [{
          data,
          borderColor: "#1C1A17",
          backgroundColor: "rgba(237,187,56,0.18)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#EDBB38",
          pointBorderColor: "#1C1A17",
          pointRadius: 4,
          borderWidth: 2.5,
        }],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, grid: { color: "#EEE7DA" }, ticks: { color: "#9c948a" } },
          x: { grid: { display: false }, ticks: { color: "#9c948a" } },
        },
      }}
    />
  );
}

export function ArtFormChart({ labels, data }: { labels: string[]; data: number[] }) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [{
          data,
          backgroundColor: ["#7C3AED", "#3B82F6", "#22C55E", "#F43F5E", "#EDBB38", "#a78bfa", "#60a5fa"],
          borderWidth: 0,
          hoverOffset: 6,
        }],
      }}
      options={{
        cutout: "68%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 10 }, color: "#1C1A17", padding: 10 },
          },
        },
      }}
    />
  );
}
