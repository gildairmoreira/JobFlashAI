import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseCustomizations } from "@/lib/permissions";
import { Circle, Square, Squircle } from "lucide-react";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";


export const BorderStyles = {
  SQUARE: "square",
  CIRCLE: "circle",
  SQUIRCLE: "squircle",
};

const borderStyles = Object.values(BorderStyles);

interface BorderStyleButtonProps {
  borderStyle: string | undefined;
  onChange: (borderStyle: string) => void;
  templateId?: string;
}

export default function BorderStyleButton({
  borderStyle,
  onChange,
  templateId,
}: BorderStyleButtonProps) {
  const premiumModal = usePremiumModal();
  const subscriptionLevel = useSubscriptionLevel();
  const isHarvard = templateId === "harvard";

  function handleClick() {
    if (isHarvard) return;
    if (!subscriptionLevel || !canUseCustomizations(subscriptionLevel)) {
      premiumModal.setOpen(true);
      return;
    }

    const currentIndex = borderStyle ? borderStyles.indexOf(borderStyle) : 0;
    const nextIndex = (currentIndex + 1) % borderStyles.length;
    onChange(borderStyles[nextIndex]);
  }

  const Icon =
    borderStyle === "square"
      ? Square
      : borderStyle === "circle"
        ? Circle
        : Squircle;

  return (
    <Button
      variant="outline"
      size="icon"
      title={
        isHarvard
          ? "Template Harvard não suporta foto de perfil"
          : "Alterar estilo de borda"
      }
      onClick={handleClick}
      disabled={isHarvard}
      className={isHarvard ? "cursor-not-allowed opacity-40" : ""}
    >
      <Icon className="size-5" />
    </Button>
  );
}
