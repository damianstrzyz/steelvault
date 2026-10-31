import { supabase } from "@/lib/supabase";

export function authErrorMessage(error: { message: string; code?: string }): string {
  const m = error.message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link.";
  if (m.includes("already registered")) return "An account with this email already exists. Try signing in.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("same password") || m.includes("different from the old")) return "Choose a password you have not used before.";
  if (m.includes("password") && m.includes("weak")) return "That password is too easy to guess. Try a longer one.";
  return "Something went wrong. Please try again.";
}

export type SignUpOutcome = "signed-in" | "confirm-email" | "already-registered";

export async function signUp(email: string, password: string, displayName: string): Promise<SignUpOutcome> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim() }, emailRedirectTo: `${window.location.origin}/login` },
  });
  if (error) throw error;
  // With email confirmation on, an existing address returns a user with no identities.
  if (data.user && data.user.identities?.length === 0) return "already-registered";
  return data.session ? "signed-in" : "confirm-email";
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
