import { supabase } from "@/lib/supabase";
import type { Currency } from "@/lib/currency";

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_path: string | null;
  preferred_currency: Currency;
  created_at: string;
  updated_at: string;
}

export interface ProfilePatch {
  username: string | null;
  display_name: string | null;
  preferred_currency: Currency;
}

export class UsernameTakenError extends Error {
  constructor() { super("Username is already taken"); }
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function updateProfile(userId: string, patch: ProfilePatch): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select("*").single();
  if (error) {
    if (error.code === "23505") throw new UsernameTakenError();
    throw error;
  }
  return data as Profile;
}
