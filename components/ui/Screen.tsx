import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export function Screen({
  children,
  className,
  scroll = true,
  edges,
}: ViewProps & {
  className?: string;
  scroll?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
}) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView edges={edges ?? ["top", "left", "right"]} className="flex-1 bg-forest-50">
      <Container
        contentContainerClassName={scroll ? cn("px-5 pb-24", className) : undefined}
        className={!scroll ? cn("flex-1 px-5", className) : undefined}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}
