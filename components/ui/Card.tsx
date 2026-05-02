import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      {...props}
      className={cn(
        "rounded-2xl bg-white p-4 shadow-sm",
        "border border-neutral-100",
        className,
      )}
    >
      {children}
    </View>
  );
}
