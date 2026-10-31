import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/features/auth/authContext";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toastContext";

export function AccountActions({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);

  async function signOut() {
    setConfirming(false);
    const { error } = await supabase.auth.signOut();
    if (error) { toast.show("Could not sign out. Please try again.", "error"); return; }
    queryClient.clear(); // drop cached private data
    onNavigate?.();
    navigate("/");
    toast.show("Signed out", "success");
  }

  if (!user) {
    return <Link to="/login" onClick={onNavigate} className={buttonStyles("primary", "md")}>Sign in</Link>;
  }
  return (
    <>
      <div className="flex items-center gap-2">
        <Link to="/profile" onClick={onNavigate} className={buttonStyles("secondary", "md")}><User className="size-4" />Profile</Link>
        <button type="button" onClick={() => setConfirming(true)} aria-label="Sign out" className="grid size-11 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg"><LogOut className="size-5" /></button>
      </div>
      <ConfirmDialog open={confirming} title="Sign out?" message="You will need to sign in again to manage your collection." confirmLabel="Sign out" onConfirm={() => void signOut()} onCancel={() => setConfirming(false)} />
    </>
  );
}
