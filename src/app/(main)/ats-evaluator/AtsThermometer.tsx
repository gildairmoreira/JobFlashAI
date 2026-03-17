"use client";

import React from "react";

interface AtsThermometerProps {
  score: number;
}

export function AtsThermometer({ score }: AtsThermometerProps) {
  // Define color based on score
  const getScoreColor = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Excelente";
    if (s >= 50) return "Bom";
    return "Precisa Melhorar";
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <span className="text-sm font-bold text-foreground">Score ATS</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </span>
      </div>
      <div className="h-4 w-full bg-secondary rounded-full overflow-hidden border">
        <div
          className={`h-full transition-all duration-1000 ease-out ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
        <span>0</span>
        <span>{score}%</span>
        <span>100</span>
      </div>
    </div>
  );
}
