/**
 * Job: Generate Ideas
 *
 * Triggered by: User completes questionnaire
 * Purpose: Generate 8-12 personalized career/finance ideas using GPT-5-nano
 *
 * Input:
 * - userId: string
 * - profileId: string
 * - goalId: string
 * - questionnaireSessionId: string
 *
 * Output:
 * - Creates 8-12 idea records in database
 * - Triggers PostHog event: 'ideas.generated'
 */

export interface GenerateIdeasPayload {
  userId: string;
  profileId: string;
  goalId: string;
  questionnaireSessionId: string;
}

export async function generateIdeas(payload: GenerateIdeasPayload): Promise<void> {
  console.log('[Job] Generate Ideas:', payload);

  // TODO: Implement in Milestone 1
  // 1. Fetch user profile, goal, questionnaire answers from Supabase
  // 2. Call research agent to gather market data
  // 3. Call GPT-5-nano with prompt template
  // 4. Parse and validate ideas
  // 5. Store ideas in database
  // 6. Trigger PostHog event

  throw new Error('Not implemented');
}