"use client";

import { ResumeServerData } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useState } from "react";
// @ts-ignore
import ATSDetailModal from "./ATSDetailModal";
import { SubscriptionLevel } from "@/lib/subscription";

interface AtsResumeCardProps {
  resume: ResumeServerData;
  atsScore: any;
  subscriptionLevel: SubscriptionLevel;
}

export default function AtsResumeCard({
  resume,
  atsScore,
  subscriptionLevel,
}: AtsResumeCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const score = atsScore?.score ?? 0;
  
  // Decide badge color based on score
  let scoreColorClass = "text-gray-400";
  let scoreRingClass = "text-gray-200";
  let bgColorClass = "bg-gray-50";
  let label = "Não avaliado";

  if (atsScore) {
    if (score < 50) {
      scoreColorClass = "text-red-600";
      scoreRingClass = "text-red-500";
      bgColorClass = "bg-red-50";
      label = "Crítico";
    } else if (score < 75) {
      scoreColorClass = "text-yellow-600";
      scoreRingClass = "text-yellow-500";
      bgColorClass = "bg-yellow-50";
      label = "Regular";
    } else if (score < 90) {
      scoreColorClass = "text-green-500";
      scoreRingClass = "text-green-400";
      bgColorClass = "bg-green-50";
      label = "Bom";
    } else {
      scoreColorClass = "text-emerald-600";
      scoreRingClass = "text-emerald-500";
      bgColorClass = "bg-emerald-50";
      label = "Excelente";
    }
  }

  // Calculate SVG stroke dasharray
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = atsScore
    ? circumference - (score / 100) * circumference
    : circumference;

  const isStale =
    atsScore && new Date(atsScore.updatedAt) < new Date(resume.updatedAt);

  return (
    <>
      <div
        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-primary hover:shadow-md"
        onClick={() => setModalOpen(true)}
      >
        <div className={`flex items-center justify-between p-4 ${bgColorClass} dark:bg-card/50`}>
          <div className="relative h-24 w-24">
            {/* SVG Ring */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-muted fill-transparent"
                strokeWidth="8"
              />
              {/* Progress circle */}
              {atsScore && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className={`fill-transparent transition-all duration-1000 ease-in-out ${scoreRingClass}`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${atsScore ? scoreColorClass : "text-muted-foreground"}`}>
                {atsScore ? score : "--"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                atsScore ? `bg-background ${scoreColorClass} shadow-sm border` : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {isStale && (
              <span className="text-[10px] uppercase text-muted-foreground bg-muted px-1.5 rounded">
                Desatualizado
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 font-semibold" title={resume.title || "Sem título"}>
            {resume.title || "Sem título"}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {resume.jobTitle || "Cargo não especificado"}
          </p>

          <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
            {atsScore ? (
              <span>Avaliado em {format(new Date(atsScore.updatedAt), "dd/MM/yyyy", { locale: ptBR })}</span>
            ) : (
              <span>Clique para avaliar</span>
            )}
            <span className="font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Ver Detalhes →
            </span>
          </div>
        </div>
      </div>

      <ATSDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        resume={resume}
        atsScore={atsScore}
        subscriptionLevel={subscriptionLevel}
      />
    </>
  );
}
