/**
 * Root-level error boundary. Uses ONLY inline styles (no NativeWind / no
 * external components) so it remains visible even if styling/native modules
 * are broken. Shows the error message + stack so we can diagnose blank-screen
 * crashes from a single screenshot.
 */
import { Component, type ReactNode } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";

type Props = { children: ReactNode };
type State = { error: Error | null; info: string | null };

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Log for `adb logcat` debugging too.
    // eslint-disable-next-line no-console
    console.error("[RootErrorBoundary]", error, info.componentStack);
    this.setState({ info: info.componentStack });
  }

  reset = () => this.setState({ error: null, info: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F2E12",
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <Text style={{ color: "#F1F6ED", fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
          Something went wrong
        </Text>
        <Text style={{ color: "rgba(241,246,237,0.7)", fontSize: 13, marginBottom: 20 }}>
          The app caught a crash before it could render. Details below.
        </Text>
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: 12,
            padding: 14,
          }}
        >
          <Text
            style={{
              color: "#FFD0D0",
              fontFamily: "monospace",
              fontSize: 12,
              marginBottom: 12,
              fontWeight: "700",
            }}
          >
            {this.state.error.name}: {this.state.error.message}
          </Text>
          {this.state.error.stack ? (
            <Text style={{ color: "#FFE5E5", fontFamily: "monospace", fontSize: 11 }}>
              {this.state.error.stack}
            </Text>
          ) : null}
          {this.state.info ? (
            <Text
              style={{
                color: "#FFE5E5",
                fontFamily: "monospace",
                fontSize: 11,
                marginTop: 12,
              }}
            >
              {this.state.info}
            </Text>
          ) : null}
        </ScrollView>
        <Pressable
          onPress={this.reset}
          style={{
            marginTop: 16,
            backgroundColor: "#4A7C2A",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
