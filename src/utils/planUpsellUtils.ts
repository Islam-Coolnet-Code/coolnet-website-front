import { Plan } from '@/utils/Plans/Plans';

/**
 * Get upsell plans based on the currently selected plan and initial preselection
 * This function determines which plans to show for upselling
 */
export const getUpsellPlans = (
  selectedPlanId: string, 
  allPlans: Plan[], 
  initialPreselectedPlanId?: string
): Plan[] => {
  // If no initial preselection, show all plans (normal browsing mode)
  if (!initialPreselectedPlanId) {
    return allPlans;
  }

  // If there's an initial preselected plan, filter based on it
  const planHierarchy: Record<string, number> = {
    'basic': 1,
    'standard': 2, 
    'premium': 3
  };

  const basePlanLevel = planHierarchy[initialPreselectedPlanId];
  
  if (basePlanLevel === undefined) {
    // Fallback for unknown plans
    return allPlans;
  }

  // Show all plans that are at the base level or higher
  // This ensures we don't hide the original selection and show upsell options
  return allPlans.filter(plan => {
    const planLevel = planHierarchy[plan.id];
    return planLevel !== undefined && planLevel >= basePlanLevel;
  });
};

/**
 * Check if a plan was preselected from the plans section
 */
export const isPlanPreselected = (initialPreselectedPlanId?: string): boolean => {
  return Boolean(initialPreselectedPlanId);
};

/**
 * Get the upsell message based on the selected plan
 */
export const getUpsellMessage = (selectedPlanId: string, t: (key: string) => string): string => {
  switch (selectedPlanId) {
    case 'basic':
      return t('order.newLine.upsell.basic');
    case 'standard':
      return t('order.newLine.upsell.standard');
    case 'premium':
      return t('order.newLine.upsell.premium');
    default:
      return '';
  }
};
