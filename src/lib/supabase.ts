import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * True when the page was opened from a password-recovery email link. Evaluated before the
 * client starts, because the client removes the URL fragment once it has read the tokens.
 */
export const startedAsRecovery =
  typeof window !== "undefined" && /[#&?]type=recovery/.test(window.location.hash + window.location.search);

// Stage 2 replaces this with a generic <Database> type generated from the schema.
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
