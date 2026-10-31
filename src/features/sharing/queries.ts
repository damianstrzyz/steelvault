import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/authContext";
import { useToast } from "@/components/ui/toastContext";
import { fetchOwnSharing, fetchSharedInfo, fetchSharedPage, regenerateShareId, saveSharing, SHARED_PAGE_SIZE } from "./api";
import type { CollectionShare, SharedFilters, SharingOptions } from "./types";

export function useOwnSharing() {
  const userId = useAuth().user?.id ?? "";
  return useQuery({ queryKey: ["sharing", userId], queryFn: () => fetchOwnSharing(userId), enabled: userId !== "" });
}

export function useSharingActions() {
  const userId = useAuth().user?.id ?? "";
  const qc = useQueryClient();
  const toast = useToast();
  const key = ["sharing", userId] as const;
  const failed = () => toast.show("Could not update sharing. Please try again.", "error");

  const save = useMutation({
    mutationFn: (o: SharingOptions) => saveSharing(o),
    onSuccess: (row) => qc.setQueryData<CollectionShare | null>(key, row),
    onError: failed,
  });

  const regenerate = useMutation({
    mutationFn: regenerateShareId,
    onSuccess: (shareId) => {
      qc.setQueryData<CollectionShare | null>(key, (prev) => (prev ? { ...prev, share_id: shareId } : prev));
      toast.show("New link created. The old link no longer works.", "success");
    },
    onError: failed,
  });

  return { save, regenerate };
}

export function useSharedInfo(shareId: string) {
  return useQuery({ queryKey: ["shared", "info", shareId], queryFn: () => fetchSharedInfo(shareId), enabled: shareId !== "", retry: false });
}

export function useSharedItems(shareId: string, filters: SharedFilters, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["shared", "items", shareId, filters],
    queryFn: ({ pageParam }) => fetchSharedPage(shareId, filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => ((last.page + 1) * SHARED_PAGE_SIZE < last.total ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
    enabled,
  });
}
