import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/authContext";
import { useToast } from "@/components/ui/toastContext";
import { addWishlist, fetchProductIdsByStatus, removeWishlist } from "./api";

export function useWishlist() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const ids = useQuery({ queryKey: ["collection", "wishlist", userId], queryFn: () => fetchProductIdsByStatus(userId, "wishlist"), enabled: userId !== "" });

  const mutation = useMutation({
    mutationFn: ({ productId, on }: { productId: string; on: boolean; name: string }) => (on ? addWishlist(userId, productId) : removeWishlist(userId, productId)),
    onSuccess: (_data, { on, name }) => {
      toast.show(on ? `Added ${name} to your wishlist` : `Removed ${name} from your wishlist`, "success");
      void qc.invalidateQueries({ queryKey: ["collection"] });
    },
    onError: () => toast.show("Could not update your wishlist. Please try again.", "error"),
  });

  function isWishlisted(productId: string): boolean | null {
    if (!user || !ids.data) return null;
    return ids.data.has(productId);
  }

  function toggle(productId: string, name: string) {
    if (!user) {
      toast.show("Sign in to keep a wishlist", "info");
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    mutation.mutate({ productId, on: !ids.data?.has(productId), name });
  }

  return { isWishlisted, toggle, busy: mutation.isPending };
}
