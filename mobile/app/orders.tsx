import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GYRO_LABELS, SIDE_LABELS, GYRO_TYPES } from "../constants/menu";
import { Order, useOrders } from "../hooks/useOrders";

const INDIGO = "#4f46e5";

export default function OrdersScreen() {
  const { orders, loading, synced, deleteOrder, clearAll, refresh } = useOrders();

  function confirmDelete(order: Order) {
    Alert.alert(
      "Remove order?",
      `Remove ${order.name}'s order?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteOrder(order.id),
        },
      ]
    );
  }

  function confirmClearAll() {
    if (orders.length === 0) return;
    Alert.alert(
      "Clear all orders?",
      "This will remove everyone's order. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear all", style: "destructive", onPress: clearAll },
      ]
    );
  }

  const gyroTotal = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.gyro_type] = (acc[o.gyro_type] ?? 0) + 1;
    return acc;
  }, {});

  if (loading && orders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={INDIGO} />
        <Text style={styles.loadingText}>Loading orders…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={INDIGO}
          />
        }
        ListHeaderComponent={
          <Header
            count={orders.length}
            synced={synced}
            totals={gyroTotal}
            onClear={confirmClearAll}
          />
        }
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item }) => (
          <OrderCard order={item} onDelete={() => confirmDelete(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Header({
  count,
  synced,
  totals,
  onClear,
}: {
  count: number;
  synced: boolean;
  totals: Record<string, number>;
  onClear: () => void;
}) {
  return (
    <View style={styles.header}>
      {/* Summary row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerCount}>
            {count} order{count !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.syncStatus}>
            {synced ? "🟢 Synced with server" : "🟡 Offline — showing cached"}
          </Text>
        </View>
        {count > 0 && (
          <Pressable style={styles.clearBtn} onPress={onClear}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {/* Gyro breakdown */}
      {count > 0 && (
        <View style={styles.breakdown}>
          {GYRO_TYPES.filter(g => totals[g.id]).map(g => (
            <View key={g.id} style={styles.breakdownChip}>
              <Text style={styles.breakdownEmoji}>{g.emoji}</Text>
              <Text style={styles.breakdownLabel}>
                {g.label} ×{totals[g.id]}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function OrderCard({
  order,
  onDelete,
}: {
  order: Order;
  onDelete: () => void;
}) {
  const gyro = GYRO_TYPES.find(g => g.id === order.gyro_type);
  const timeLabel = formatTime(order.created_at);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardEmoji}>{gyro?.emoji ?? "🥙"}</Text>
          <View>
            <Text style={styles.cardName}>{order.name}</Text>
            <Text style={styles.cardTime}>{timeLabel}</Text>
          </View>
        </View>
        <Pressable
          style={styles.deleteBtn}
          onPress={onDelete}
          hitSlop={8}
        >
          <Text style={styles.deleteIcon}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.cardBody}>
        <Tag label={GYRO_LABELS[order.gyro_type] ?? order.gyro_type} primary />

        {order.sides.length > 0 && (
          <View style={styles.sideRow}>
            {order.sides.map(s => (
              <Tag key={s} label={SIDE_LABELS[s] ?? s} />
            ))}
          </View>
        )}

        {order.notes ? (
          <Text style={styles.cardNotes}>📝 {order.notes}</Text>
        ) : null}
      </View>
    </View>
  );
}

function Tag({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <View style={[styles.tag, primary && styles.tagPrimary]}>
      <Text style={[styles.tagText, primary && styles.tagTextPrimary]}>
        {label}
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🫙</Text>
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySubtitle}>
        Switch to the Order tab to place the first order!
      </Text>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "#6b7280", fontSize: 14 },
  list: { padding: 16, paddingBottom: 32 },

  // Header
  header: { marginBottom: 16, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  headerCount: { fontSize: 20, fontWeight: "800", color: "#111827" },
  syncStatus: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  clearText: { fontSize: 12, fontWeight: "600", color: "#ef4444" },

  // Breakdown chips
  breakdown: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  breakdownChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  breakdownEmoji: { fontSize: 14 },
  breakdownLabel: { fontSize: 12, fontWeight: "600", color: "#374151" },

  // Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardEmoji: { fontSize: 30 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardTime: { fontSize: 11, color: "#9ca3af", marginTop: 1 },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: { fontSize: 11, color: "#ef4444", fontWeight: "700" },

  // Card body
  cardBody: { gap: 8 },
  sideRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cardNotes: { fontSize: 13, color: "#6b7280", fontStyle: "italic" },

  // Tags
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagPrimary: { backgroundColor: "#eef2ff" },
  tagText: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  tagTextPrimary: { color: INDIGO },

  // Empty
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151" },
  emptySubtitle: { fontSize: 14, color: "#9ca3af", textAlign: "center", paddingHorizontal: 32 },
});
