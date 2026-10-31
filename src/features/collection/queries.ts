import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/authContext";
import { useToast } from "@/components/ui/toastContext";
import { fetchCollection, fetchCollectionCounts, fetchSetCompletion, moveToOwned, removeCollectionItem, updateCollectionItem } from "./api";
import type { CollectionItem, ItemPatch } from "./types";

function useUserId(): string {
  return useAuth().user?.id ?? "";
}

export function useCollectionItems(enabled = true) {
  const userId = useUserId();
  return useQuery({ queryKey: ["collection", "items", userId], queryFn: () => fetchCollection(userId), enabled: enabled && userId !== "" });
}

export function useCollectionCounts() {
  const userId = useUserId();
  return useQuery({ queryKey: ["collection", "counts", userId], queryFn: fetchCollectionCounts, enabled: userId !== "" });
}

export function useSetCompletion() {
  const userId = useUserId();
  return useQuery({ queryKey: ["collection", "sets", userId], queryFn: fetchSetCompletion, enabled: userId !== "" });
}

export function useCollectionActions() {
  const userId = useUserId();
  const qc = useQueryClient();
  const toast = useToast();
  const itemsKey = ["collection", "items", userId] as const;

  const refreshSummaries = () => {
    void qc.invalidateQueries({ queryKey: ["collection", "counts", userId] });
    void qc.invalidateQueries({ queryKey: ["collection", "sets", userId] });
    void qc.invalidateQueries({ queryKey: ["collection", "owned", userId] });
    void qc.invalidateQueries({ queryKey: ["collection", "wishlist", userId] });
    void qc.invalidateQueries({ queryKey: ["catalog", "missing"] });
  };
  const failed = () => toast.show("Something went wrong. Please try again.", "error");

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ItemPatch> }) => updateCollectionItem(userId, id, patch),
    onSuccess: (updated) => {
      qc.setQueryData<CollectionItem[]>(itemsKey, (prev) => prev?.map((i) => (i.id === updated.id ? updated : i)));
      toast.show("Changes saved", "success");
    },
    onError: failed,
  });

  const remove = useMutation({
    mutationFn: (item: CollectionItem) => removeCollectionItem(userId, item.id),
    onSuccess: (_data, item) => {
      qc.setQueryData<CollectionItem[]>(itemsKey, (prev) => prev?.filter((i) => i.id !== item.id));
      refreshSummaries();
      toast.show(`Removed ${item.products.name}`, "success");
    },
    onError: failed,
  });

  const markOwned = useMutation({
    mutationFn: (item: CollectionItem) => moveToOwned(userId, item),
    onSuccess: (_data, item) => {
      void qc.invalidateQueries({ queryKey: itemsKey });
      refreshSummaries();
      toast.show(`${item.products.name} is now in your collection`, "success");
    },
    onError: failed,
  });

  return { update, remove, markOwned };
}
