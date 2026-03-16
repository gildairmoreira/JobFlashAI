import { SubscriptionLevel } from "./subscription";

export function canCreateResume(
  subscriptionLevel: SubscriptionLevel,
  currentResumeCount: number,
) {
  const maxResumeMap: Record<SubscriptionLevel, number> = {
    free: 1,
    pro: 3,
    lifetime: Infinity,
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

/** Duplicar currículo — disponível para PRO (semanal) e LIFETIME (mensal) */
export function canDuplicateResume(subscriptionLevel: SubscriptionLevel) {
  return subscriptionLevel === "pro" || subscriptionLevel === "lifetime";
}

/** Gerar currículo para vaga — exclusivo do plano LIFETIME (mensal) */
export function canGenerateForJob(subscriptionLevel: SubscriptionLevel) {
  return subscriptionLevel === "lifetime";
}
