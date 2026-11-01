import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/authContext";
import { fetchProfile } from "./api";

export function useProfile() {
  const userId = useAuth().user?.id ?? "";
  return useQuery({ queryKey: ["profile", userId], queryFn: () => fetchProfile(userId), enabled: userId !== "" });
}
