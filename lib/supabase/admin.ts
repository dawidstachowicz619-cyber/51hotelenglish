import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isCloudStorageEnabled } from "@/lib/db/config";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!isCloudStorageEnabled()) {
    throw new Error("Cloud storage is not configured");
  }
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return adminClient;
}
