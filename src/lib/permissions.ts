import { SubscriptionLevel } from "./subscription";

export function canCreateResume(
  subscriptionLevel: SubscriptionLevel,
  currentResumeCount: number,
) {
  // Todas as funcionalidades liberadas - sem restrições
  return true;
}

export function canUseAITools(subscriptionLevel: SubscriptionLevel) {
  // Ferramentas de IA liberadas para todos
  return true;
}

export function canUseCustomizations(subscriptionLevel: SubscriptionLevel) {
  // Personalizações liberadas para todos
  return true;
}
