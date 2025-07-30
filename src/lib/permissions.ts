import { SubscriptionLevel } from "./subscription";

export function canCreateResume(
  subscriptionLevel: SubscriptionLevel,
  currentResumeCount: number,
) {
  // Temporariamente permitir criação ilimitada de currículos
  return true;
}

export function canUseAITools(subscriptionLevel: SubscriptionLevel) {
  // Temporariamente permitir uso de ferramentas de IA para todos
  return true;
}

export function canUseCustomizations(subscriptionLevel: SubscriptionLevel) {
  // Temporariamente permitir customizações para todos
  return true;
}
