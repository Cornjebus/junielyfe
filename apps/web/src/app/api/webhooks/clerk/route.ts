import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@junielyfe/db';

/**
 * Clerk Webhook Handler
 *
 * Syncs user data from Clerk to Supabase database
 * Handles: user.created, user.updated, user.deleted events
 */
export async function POST(req: Request) {
  // Get webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with the webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification failed', {
      status: 400,
    });
  }

  // Initialize Supabase client
  const supabase = createSupabaseServerClient();

  // Log webhook event to database for debugging
  const { error: logError } = await supabase
    .from('clerk_webhook_events')
    .insert({
      event_type: evt.type,
      clerk_user_id: evt.data.id || null,
      payload: evt.data as any,
      processed: false,
    });

  if (logError) {
    console.error('Error logging webhook event:', logError);
  }

  // Handle the webhook event
  try {
    switch (evt.type) {
      case 'user.created':
        await handleUserCreated(evt);
        break;
      case 'user.updated':
        await handleUserUpdated(evt);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt);
        break;
      default:
        console.log(`Unhandled webhook event type: ${evt.type}`);
    }

    // Mark webhook as processed
    await supabase
      .from('clerk_webhook_events')
      .update({ processed: true })
      .eq('clerk_user_id', evt.data.id || '')
      .eq('event_type', evt.type);

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);

    // Log error to database
    await supabase
      .from('clerk_webhook_events')
      .update({
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('clerk_user_id', evt.data.id || '')
      .eq('event_type', evt.type);

    return new Response('Error: Webhook processing failed', { status: 500 });
  }
}

/**
 * Handle user.created event
 * Creates a new user record in Supabase
 */
async function handleUserCreated(evt: WebhookEvent) {
  if (evt.type !== 'user.created') return;

  const supabase = createSupabaseServerClient();
  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  const primaryEmail = email_addresses.find(e => e.id === evt.data.primary_email_address_id);

  const { error } = await supabase
    .from('users')
    .insert({
      clerk_user_id: id,
      email: primaryEmail?.email_address || '',
      first_name: first_name || null,
      last_name: last_name || null,
      image_url: image_url || null,
    });

  if (error) {
    console.error('Error creating user in Supabase:', error);
    throw error;
  }

  console.log(`✅ User created in Supabase: ${id}`);
}

/**
 * Handle user.updated event
 * Updates existing user record in Supabase
 */
async function handleUserUpdated(evt: WebhookEvent) {
  if (evt.type !== 'user.updated') return;

  const supabase = createSupabaseServerClient();
  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  const primaryEmail = email_addresses.find(e => e.id === evt.data.primary_email_address_id);

  const { error } = await supabase
    .from('users')
    .update({
      email: primaryEmail?.email_address || '',
      first_name: first_name || null,
      last_name: last_name || null,
      image_url: image_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_user_id', id);

  if (error) {
    console.error('Error updating user in Supabase:', error);
    throw error;
  }

  console.log(`✅ User updated in Supabase: ${id}`);
}

/**
 * Handle user.deleted event
 * Soft deletes user record in Supabase
 */
async function handleUserDeleted(evt: WebhookEvent) {
  if (evt.type !== 'user.deleted') return;

  const supabase = createSupabaseServerClient();
  const { id } = evt.data;

  const { error } = await supabase
    .from('users')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('clerk_user_id', id || '');

  if (error) {
    console.error('Error soft-deleting user in Supabase:', error);
    throw error;
  }

  console.log(`✅ User soft-deleted in Supabase: ${id}`);
}
