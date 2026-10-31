import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { AuthCard, FormAlert } from "@/features/auth/AuthCard";
import { authErrorMessage, signUp } from "@/features/auth/api";
import { useAuth } from "@/features/auth/authContext";
import { redirectFromState, validateConfirm, validateEmail, validatePassword } from "@/features/auth/validation";

interface Errors { name?: string; email?: string; password?: string; confirm?: string; form?: string }

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (loading) return <PageSpinner />;
  if (user) return <Navigate to={redirectFromState(location.state)} replace />;

  if (sentTo) {
    return (
      <AuthCard title="Check your email" footer={<Link to="/login" className="text-accent hover:underline">Back to sign in</Link>}>
        <div className="flex flex-col items-center gap-3 text-center">
          <MailCheck className="size-10 text-ok" aria-hidden="true" />
          <p className="text-sm text-muted">We sent a confirmation link to <strong className="text-fg">{sentTo}</strong>. Open it to activate your account, then sign in.</p>
        </div>
      </AuthCard>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    const next: Errors = {
      name: trimmed.length === 0 ? "Enter a display name." : trimmed.length > 60 ? "Use 60 characters or fewer." : undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirm: validateConfirm(password, confirm) ?? undefined,
    };
    if (next.name || next.email || next.password || next.confirm) { setErrors(next); return; }
    setErrors({});
    setBusy(true);
    try {
      const outcome = await signUp(email, password, trimmed);
      if (outcome === "confirm-email") setSentTo(email.trim());
      else if (outcome === "already-registered") setErrors({ form: "An account with this email already exists. Try signing in." });
      // "signed-in": the auth listener updates the session and this page redirects
    } catch (err) {
      setErrors({ form: authErrorMessage(err as Error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Track your steelbooks and games in one place."
      footer={<>Already have an account? <Link to="/login" state={location.state} className="text-accent hover:underline">Sign in</Link></>}
    >
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
        {errors.form && <FormAlert>{errors.form}</FormAlert>}
        <Input label="Display name" autoComplete="nickname" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Input label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="At least 8 characters." />
        <Input label="Confirm password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <Button type="submit" loading={busy} className="w-full">Create account</Button>
      </form>
    </AuthCard>
  );
}
