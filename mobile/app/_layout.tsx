import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

const INDIGO = "#4f46e5";
const GRAY   = "#9ca3af";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   INDIGO,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: "#111827",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Order",
          tabBarLabel: "Order",
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="🥙" color={color} size={size} />
          ),
          headerTitle: "🥙 Gyro Order",
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Team Orders",
          tabBarLabel: "Team",
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="👥" color={color} size={size} />
          ),
          headerTitle: "👥 Team Orders",
        }}
      />
    </Tabs>
  );
}

// Minimal emoji tab icon that respects the active tint colour via opacity
function TabIcon({ emoji, color, size }: { emoji: string; color: string; size: number }) {
  const { Text } = require("react-native");
  const active = color === INDIGO;
  return (
    <Text style={{ fontSize: size - 2, opacity: active ? 1 : 0.45 }}>
      {emoji}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopColor:  "#e5e7eb",
    borderTopWidth:  1,
    height: 60,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#ffffff",
    shadowColor:     "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
});
