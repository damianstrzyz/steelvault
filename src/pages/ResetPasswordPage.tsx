import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { useToast } from "@/components/ui/toastContext";
import { AuthCard, FormAlert, FormNotice } from "@/features/auth/AuthCard";
import { authErrorMessage, requestPasswordReset } from "@/features/auth/api";
import { useAuth } from "@/features/auth/authContext";
import { ChangePasswordForm } from "@/features/auth/ChangePasswordForm";
import { validateEmail } from "@/features/auth/validation";

function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const problem = validateEmail(email);
    if (problem) { setError(problem); return; }
    setError(null);
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setSent(true); // same message whether or not the account exists
    } catch (err) {
      setError(authErrorMessage(err as Error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your email and we will send you a link to choose a new password."
      footer={<Link to="/login" className="text-accent hover:underline">Back to sign in</Link>}
    >
      {sent ? (
        <FormNotice>If an account exists for {email.trim()}, a reset link is on its way. Check your inbox and spam folder.</FormNotice>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
          {error && !validateEmail(email) && <FormAlert>{error}</FormAlert>}
          <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={validateEmail(email) ? error : null} />
          <Button type="submit" loading={busy} className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  const { user, loading, recovering } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  if (loading) return <PageSpinner />;
  if (recovering && user) {
    return (
      <AuthCard title="Choose a new password" subtitle="You are signed in through your reset link.">
        <ChangePasswordForm submitLabel="Save new password" onDone={() => { toast.show("Password updated", "success"); navigate("/"); }} />
      </AuthCard>
    );
  }
  return <RequestResetForm />;
}
