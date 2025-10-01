/**
 * Job: Generate Artifact
 *
 * Triggered by: User requests artifact generation
 * Purpose: Generate specific artifacts (résumé, LinkedIn copy, outreach templates, etc.)
 *
 * Input:
 * - userId: string
 * - artifactType: 'resume' | 'linkedin_headline' | 'outreach_template' | 'portfolio_brief' | 'learning_plan'
 * - context: Record<string, any>
 *
 * Output:
 * - Creates artifact record in database
 * - Triggers PostHog event: 'artifact.generated'
 */

export interface GenerateArtifactPayload {
  userId: string;
  artifactType: string;
  context: Record<string, any>;
}

export async function generateArtifact(payload: GenerateArtifactPayload): Promise<void> {
  console.log('[Job] Generate Artifact:', payload);

  // TODO: Implement in Milestone 2
  // 1. Fetch user profile and related data
  // 2. Load artifact template/prompt
  // 3. Call GPT-5-nano with specialized prompt
  // 4. Parse and format artifact
  // 5. Store artifact in database
  // 6. Trigger PostHog event

  throw new Error('Not implemented');
}