import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { AuthCard, FormAlert } from "@/features/auth/AuthCard";
import { authErrorMessage, signIn } from "@/features/auth/api";
import { useAuth } from "@/features/auth/authContext";
import { redirectFromState, validateEmail } from "@/features/auth/validation";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  if (loading) return <PageSpinner />;
  if (user) return <Navigate to={redirectFromState(location.state)} replace />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = { email: validateEmail(email) ?? undefined, password: password ? undefined : "Enter your password." };
    if (next.email || next.password) { setErrors(next); return; }
    setErrors({});
    setBusy(true);
    try {
      await signIn(email, password); // the auth listener updates the session and this page redirects
    } catch (err) {
      setErrors({ form: authErrorMessage(err as Error) });
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back to your collection."
      footer={<>New here? <Link to="/register" state={location.state} className="text-accent hover:underline">Create an account</Link></>}
    >
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
        {errors.form && <FormAlert>{errors.form}</FormAlert>}
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="text-right text-sm"><Link to="/reset-password" className="text-muted hover:text-fg">Forgot your password?</Link></div>
        <Button type="submit" loading={busy} className="w-full">Sign in</Button>
      </form>
    </AuthCard>
  );
}
