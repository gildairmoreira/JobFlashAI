"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AtsThermometerProps {
  score: number;
  label?: string;
  className?: string;
}

export function AtsThermometer({
  score = 0,
  label = "Score ATS",
  className = "",
}: AtsThermometerProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = Math.min(Math.max(score, 0), 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getGradientColor = (percent: number) => {
    if (percent < 33) {
      return "from-red-500 via-red-400 to-orange-400";
    } else if (percent < 66) {
      return "from-orange-400 via-yellow-400 to-yellow-300";
    } else {
      return "from-yellow-300 via-green-400 to-green-500";
    }
  };

  const getScoreColor = (percent: number) => {
    if (percent < 33) {
      return "text-red-500";
    } else if (percent < 66) {
      return "text-orange-500";
    } else {
      return "text-green-500";
    }
  };

  const getStatusLabel = (percent: number) => {
    if (percent < 33) return "Pobre";
    if (percent < 66) return "Regular";
    if (percent < 85) return "Bom";
    return "Excelente";
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground tracking-tight">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-2xl font-bold tracking-tighter ${getScoreColor(percentage)}`}
          >
            {score}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            /100
          </span>
        </div>
      </div>

      {/* Barra ultra-fina */}
      <div className="relative w-full h-1 bg-muted/30 overflow-hidden rounded-full font-sans">
        <motion.div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getGradientColor(
            percentage
          )}`}
          initial={{ width: 0 }}
          animate={{ width: `${animatedScore}%` }}
          transition={{
            duration: 1.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">
          {getStatusLabel(percentage)}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground/60">
          Progresso de Otimização
        </span>
      </div>
    </div>
  );
}
