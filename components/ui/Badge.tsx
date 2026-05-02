import { View, Text } from "react-native";
import { cn } from "@/lib/utils";
import { edibilityColor, edibilityLabel } from "@/lib/utils";

export function Badge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: "neutral" | "edible" | "warn" | "toxic" | "info";
  className?: string;
}) {
  const map = {
    neutral: "bg-neutral-100 text-neutral-700",
    edible: "bg-edible-500/10 text-edible-600",
    warn: "bg-warn-500/15 text-amber-700",
    toxic: "bg-toxic-500/10 text-toxic-700",
    info: "bg-forest-100 text-forest-700",
  } as const;
  return (
    <View className={cn("rounded-full px-2.5 py-1", map[tone].split(" ")[0], className)}>
      <Text className={cn("text-xs font-semibold", map[tone].split(" ")[1])}>{label}</Text>
    </View>
  );
}

export function EdibilityBadge({ edibility }: { edibility: string }) {
  const tone =
    edibility === "edible"
      ? "edible"
      : edibility === "edible_with_caution"
        ? "warn"
        : edibility === "poisonous" || edibility === "deadly"
          ? "toxic"
          : "neutral";
  return <Badge label={edibilityLabel(edibility)} tone={tone} />;
}

export { edibilityColor };
