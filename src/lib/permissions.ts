import { SubscriptionLevel } from "./subscription";

export function canCreateResume(
  subscriptionLevel: SubscriptionLevel,
  currentResumeCount: number,
) {
  const maxResumeMap: Record<SubscriptionLevel, number> = {
    free: 1,
    pro: Infinity,
    monthly: Infinity,
    frozen: 0,
    banned: 0,
  };

  const maxResumes = maxResumeMap[subscriptionLevel];

  return currentResumeCount < maxResumes;
}

export function canUseAITools(subscriptionLevel: SubscriptionLevel) {
  return subscriptionLevel !== "free";
}

export function canUseCustomizations(subscriptionLevel: SubscriptionLevel) {
  return subscriptionLevel !== "free";
}

/** Duplicar currículo — disponível para PRO (semanal) e MONTHLY (mensal) */
export function canDuplicateResume(subscriptionLevel: SubscriptionLevel) {
  return subscriptionLevel === "pro" || subscriptionLevel === "monthly";
}

/** Gerar currículo para vaga (Vaga-Fit AI) — todos têm acesso, mas os limites mudam */
export function canGenerateForJob(subscriptionLevel: SubscriptionLevel) {
  return subscriptionLevel !== "frozen" && subscriptionLevel !== "banned";
}

export function getJobFitLimit(subscriptionLevel: SubscriptionLevel): number {
  switch (subscriptionLevel) {
    case "monthly":
      return 25;
    case "pro":
      return 5;
    case "free":
      return 1;
    default:
      return 0;
  }
}
