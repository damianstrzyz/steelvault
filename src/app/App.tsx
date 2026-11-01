import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { PwaUpdatePrompt } from "@/components/layout/PwaUpdatePrompt";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { router } from "./routes";

export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <PwaUpdatePrompt />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
