/**
 * Job: Generate Plan
 *
 * Triggered by: User selects ideas
 * Purpose: Generate 4-week actionable plan with tasks and milestones
 *
 * Input:
 * - userId: string
 * - selectedIdeaIds: string[]
 *
 * Output:
 * - Creates plan record in database
 * - Creates 10-20 task records
 * - Triggers PostHog event: 'plan.created'
 */

export interface GeneratePlanPayload {
  userId: string;
  selectedIdeaIds: string[];
}

export async function generatePlan(payload: GeneratePlanPayload): Promise<void> {
  console.log('[Job] Generate Plan:', payload);

  // TODO: Implement in Milestone 2
  // 1. Fetch selected ideas from database
  // 2. Call GPT-5-nano with plan generation prompt
  // 3. Parse and validate plan structure
  // 4. Create plan record
  // 5. Create task records (with dependencies)
  // 6. Trigger PostHog event

  throw new Error('Not implemented');
}