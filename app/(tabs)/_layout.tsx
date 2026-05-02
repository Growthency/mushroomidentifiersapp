import { Tabs } from "expo-router";
import { Home, Camera, BookOpen, NotebookPen, User } from "lucide-react-native";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2D5016",
        tabBarInactiveTintColor: "#6A9C4F",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#DCE9D2",
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: "Home", tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="identify"
        options={{
          title: "Identify",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                backgroundColor: "#4A7C2A",
                width: 56,
                height: 56,
                borderRadius: 28,
                marginTop: -16,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              <Camera size={26} color="#fff" />
            </View>
          ),
          tabBarLabelStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size }) => <NotebookPen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
