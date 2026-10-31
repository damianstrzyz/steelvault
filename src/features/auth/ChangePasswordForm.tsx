import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormAlert } from "./AuthCard";
import { authErrorMessage, updatePassword } from "./api";
import { validateConfirm, validatePassword } from "./validation";

interface Props { submitLabel?: string; onDone: () => void }

export function ChangePasswordForm({ submitLabel = "Update password", onDone }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = { password: validatePassword(password) ?? undefined, confirm: validateConfirm(password, confirm) ?? undefined };
    if (next.password || next.confirm) { setErrors(next); return; }
    setErrors({});
    setBusy(true);
    try {
      await updatePassword(password);
      setPassword(""); setConfirm("");
      onDone();
    } catch (err) {
      setErrors({ form: authErrorMessage(err as Error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
      {errors.form && <FormAlert>{errors.form}</FormAlert>}
      <Input label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="At least 8 characters." />
      <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
      <Button type="submit" loading={busy} className="w-full">{submitLabel}</Button>
    </form>
  );
}
