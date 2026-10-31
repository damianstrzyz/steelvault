import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/authContext";
import { useToast } from "@/components/ui/toastContext";
import { addOwned, fetchOwnedProductIds, removeOwned } from "./api";

interface ToggleVars { productId: string; owned: boolean; name: string }

export function useOwnership() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const key = ["collection", "owned", userId] as const;

  const owned = useQuery({ queryKey: key, queryFn: () => fetchOwnedProductIds(userId), enabled: userId !== "" });

  const mutation = useMutation({
    mutationFn: ({ productId, owned: target }: ToggleVars) => (target ? addOwned(userId, productId) : removeOwned(userId, productId)),
    onMutate: async ({ productId, owned: target }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Set<string>>(key);
      const next = new Set(previous ?? []);
      if (target) next.add(productId); else next.delete(productId);
      qc.setQueryData(key, next);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
      toast.show("Could not update your collection. Please try again.", "error");
    },
    onSuccess: (_data, { owned: target, name }) => toast.show(target ? `Added ${name} to your collection` : `Removed ${name} from your collection`, "success"),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["collection"] });
      void qc.invalidateQueries({ queryKey: ["catalog", "missing"] });
    },
  });

  /** true = owned, false = not owned, null = unknown (signed out or still loading). */
  function isOwned(productId: string): boolean | null {
    if (!user || !owned.data) return null;
    return owned.data.has(productId);
  }

  function toggle(productId: string, name: string) {
    if (!user) {
      toast.show("Sign in to build your collection", "info");
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    mutation.mutate({ productId, owned: !owned.data?.has(productId), name });
  }

  return { isOwned, toggle, signedIn: Boolean(user) };
}

export type Ownership = ReturnType<typeof useOwnership>;
