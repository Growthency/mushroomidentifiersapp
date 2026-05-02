import { TextInput, View, Text, type TextInputProps } from "react-native";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type InputProps = Omit<TextInputProps, "className"> & {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  containerClassName?: string;
};

export function Input({ label, error, hint, className, containerClassName, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View className={cn("w-full gap-1", containerClassName)}>
      {label ? <Text className="text-sm font-semibold text-forest-800">{label}</Text> : null}
      <TextInput
        placeholderTextColor="#9CA3AF"
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={cn(
          "rounded-lg border bg-white px-4 py-3 text-base text-forest-900",
          focused ? "border-forest-500" : "border-neutral-200",
          error && "border-toxic-500",
          className,
        )}
      />
      {error ? <Text className="text-xs text-toxic-500">{error}</Text> : null}
      {hint && !error ? <Text className="text-xs text-neutral-500">{hint}</Text> : null}
    </View>
  );
}
