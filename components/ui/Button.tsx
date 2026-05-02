import { Pressable, Text, ActivityIndicator, View } from "react-native";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_BG: Record<Variant, string> = {
  primary: "bg-forest-500 active:bg-forest-600",
  secondary: "bg-forest-100 active:bg-forest-200",
  ghost: "bg-transparent active:bg-forest-50",
  danger: "bg-toxic-500 active:bg-toxic-700",
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-forest-800",
  ghost: "text-forest-700",
  danger: "text-white",
};

const SIZE_PAD: Record<Size, string> = {
  sm: "px-3 py-2 rounded-md",
  md: "px-4 py-3 rounded-lg",
  lg: "px-6 py-4 rounded-xl",
};

const SIZE_TEXT: Record<Size, string> = {
  sm: "text-sm font-semibold",
  md: "text-base font-semibold",
  lg: "text-lg font-bold",
};

export type ButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  haptic?: boolean;
};

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  icon,
  iconRight,
  className,
  fullWidth = true,
  haptic = true,
}: ButtonProps) {
  const handlePress = () => {
    if (loading || disabled) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading || disabled}
      className={cn(
        VARIANT_BG[variant],
        SIZE_PAD[size],
        fullWidth && "w-full",
        (loading || disabled) && "opacity-50",
        "flex-row items-center justify-center gap-2",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? "#fff" : "#2D5016"} />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <Text className={cn(VARIANT_TEXT[variant], SIZE_TEXT[size])}>{children}</Text>
          {iconRight ? <View>{iconRight}</View> : null}
        </>
      )}
    </Pressable>
  );
}
