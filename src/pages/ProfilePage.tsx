import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/toastContext";
import { useAuth } from "@/features/auth/authContext";
import { ChangePasswordForm } from "@/features/auth/ChangePasswordForm";
import { SharingSettings } from "@/features/sharing/SharingSettings";
import { fetchProfile, updateProfile, UsernameTakenError, type Profile } from "@/features/profile/api";
import { CURRENCIES, type Currency } from "@/lib/currency";

const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));
const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [currency, setCurrency] = useState<Currency>(profile.preferred_currency);
  const [errors, setErrors] = useState<{ displayName?: string; username?: string }>({});

  const save = useMutation({
    mutationFn: (patch: Parameters<typeof updateProfile>[1]) => updateProfile(profile.id, patch),
    onSuccess: (updated) => {
      qc.setQueryData(["profile", profile.id], updated);
      toast.show("Profile saved", "success");
    },
    onError: (err) => {
      if (err instanceof UsernameTakenError) setErrors({ username: "That username is taken. Try another one." });
      else toast.show("Could not save your profile. Please try again.", "error");
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = displayName.trim();
    const handle = username.trim().toLowerCase();
    const next = {
      displayName: name.length === 0 ? "Enter a display name." : name.length > 60 ? "Use 60 characters or fewer." : undefined,
      username: handle !== "" && !USERNAME_RE.test(handle) ? "Use 3 to 30 letters, numbers or underscores." : undefined,
    };
    if (next.displayName || next.username) { setErrors(next); return; }
    setErrors({});
    save.mutate({ display_name: name, username: handle === "" ? null : handle, preferred_currency: currency });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Input label="Email" value={email} readOnly disabled hint="Your email is private and never shown on shared collections." />
      <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={errors.displayName} hint="Shown on your shared collection page." />
      <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} placeholder="optional" autoCapitalize="none" autoCorrect="off" />
      <Select label="Preferred currency" value={currency} options={currencyOptions} onChange={(e) => setCurrency(e.target.value as Currency)} />
      <Button type="submit" loading={save.isPending}>Save changes</Button>
    </form>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.id ?? "";
  const profile = useQuery({ queryKey: ["profile", userId], queryFn: () => fetchProfile(userId), enabled: userId !== "" });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Profile" description="Manage your account details." />
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Details</h2>
        {profile.isPending ? <PageSpinner />
          : profile.isError ? <ErrorState message="We could not load your profile." onRetry={() => void profile.refetch()} />
          : profile.data ? <ProfileForm key={profile.data.updated_at} profile={profile.data} email={user?.email ?? ""} />
          : <ErrorState title="Profile not found" message="Your profile row is missing. Run migration 0005_profiles_backfill.sql, then reload." />}
      </section>
      <SharingSettings />
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Change password</h2>
        <ChangePasswordForm onDone={() => toast.show("Password updated", "success")} />
      </section>
    </div>
  );
}
