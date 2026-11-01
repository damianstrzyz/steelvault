import { useState } from "react";
import { Download } from "lucide-react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";
import { useInstallPrompt } from "@/lib/useInstallPrompt";

export function InstallButton() {
  const { canInstall, showIosHint, install } = useInstallPrompt();
  const [iosOpen, setIosOpen] = useState(false);
  if (!canInstall && !showIosHint) return null;
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => (canInstall ? void install() : setIosOpen(true))}>
        <Download className="size-4" />Install app
      </Button>
      <AlertDialog open={iosOpen} title="Install on iPhone or iPad" message="Tap the Share button in Safari, then choose “Add to Home Screen”." onClose={() => setIosOpen(false)} />
    </>
  );
}
