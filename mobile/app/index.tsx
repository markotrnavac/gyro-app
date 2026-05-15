import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GYRO_TYPES, SIDES } from "../constants/menu";
import { useOrders } from "../hooks/useOrders";

const INDIGO      = "#4f46e5";
const INDIGO_LIGHT = "#eef2ff";
const NAME_KEY    = "gyro_user_name";

export default function OrderScreen() {
  const { submitOrder } = useOrders();

  const [name,          setName]         = useState("");
  const [gyroType,      setGyroType]     = useState<string | null>(null);
  const [selectedSides, setSelectedSides] = useState<Set<string>>(new Set());
  const [notes,         setNotes]        = useState("");
  const [submitting,    setSubmitting]   = useState(false);
  const [submitted,     setSubmitted]    = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // Restore the user's name across sessions
  useEffect(() => {
    AsyncStorage.getItem(NAME_KEY)
      .then(v => { if (v) setName(v); })
      .catch(() => {});
  }, []);

  function toggleSide(id: string) {
    setSelectedSides(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Name required", "Please enter your name before ordering.");
      return;
    }
    if (!gyroType) {
      Alert.alert("Gyro required", "Please pick a gyro type.");
      return;
    }

    setSubmitting(true);
    await AsyncStorage.setItem(NAME_KEY, trimmedName);

    await submitOrder({
      name:      trimmedName,
      gyro_type: gyroType,
      sides:     [...selectedSides],
      notes:     notes.trim() || undefined,
    });

    setSubmitting(false);
    setSubmitted(true);
    setGyroType(null);
    setSelectedSides(new Set());
    setNotes("");
    scrollRef.current?.scrollTo({ y: 0, animated: true });

    setTimeout(() => setSubmitted(false), 3000);
  }

  const canSubmit = name.trim().length > 0 && gyroType !== null;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Success banner */}
          {submitted && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✅ Order submitted!</Text>
            </View>
          )}

          {/* Name */}
          <Section label="Your Name">
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Alex"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="done"
              maxLength={80}
            />
          </Section>

          {/* Gyro type */}
          <Section label="Choose Your Gyro">
            <View style={styles.gyroGrid}>
              {GYRO_TYPES.map(g => {
                const selected = gyroType === g.id;
                return (
                  <Pressable
                    key={g.id}
                    style={[styles.gyroCard, selected && styles.gyroCardSelected]}
                    onPress={() => setGyroType(g.id)}
                    android_ripple={{ color: INDIGO_LIGHT }}
                  >
                    <Text style={styles.gyroEmoji}>{g.emoji}</Text>
                    <Text style={[styles.gyroLabel, selected && styles.gyroLabelSelected]}>
                      {g.label}
                    </Text>
                    <Text style={[styles.gyroDesc, selected && styles.gyroDeskSelected]}>
                      {g.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* Sides */}
          <Section label="Side Dishes  (optional)">
            <View style={styles.sidesGrid}>
              {SIDES.map(s => {
                const on = selectedSides.has(s.id);
                return (
                  <Pressable
                    key={s.id}
                    style={[styles.sideChip, on && styles.sideChipSelected]}
                    onPress={() => toggleSide(s.id)}
                    android_ripple={{ color: INDIGO_LIGHT }}
                  >
                    <Text style={styles.sideEmoji}>{s.emoji}</Text>
                    <Text style={[styles.sideLabel, on && styles.sideLabelSelected]}>
                      {s.label}
                    </Text>
                    {on && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* Notes */}
          <Section label="Special Requests  (optional)">
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              placeholder="e.g. No onions, extra sauce…"
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              maxLength={300}
              textAlignVertical="top"
            />
          </Section>

          {/* Submit */}
          <Pressable
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            android_ripple={{ color: "#3730a3" }}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>Place Order</Text>
            }
          </Pressable>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 8,
  },

  // Success banner
  successBanner: {
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 4,
  },
  successText: {
    color: "#166534",
    fontWeight: "700",
    fontSize: 15,
  },

  // Section
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // Text input
  textInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  notesInput: {
    height: 80,
    paddingTop: 12,
  },

  // Gyro grid (2-column)
  gyroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gyroCard: {
    width: "47%",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  gyroCardSelected: {
    borderColor: INDIGO,
    backgroundColor: INDIGO_LIGHT,
  },
  gyroEmoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  gyroLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  gyroLabelSelected: {
    color: INDIGO,
  },
  gyroDesc: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
  },
  gyroDeskSelected: {
    color: "#6366f1",
  },

  // Sides (full-width chips)
  sidesGrid: {
    gap: 8,
  },
  sideChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sideChipSelected: {
    borderColor: INDIGO,
    backgroundColor: INDIGO_LIGHT,
  },
  sideEmoji: {
    fontSize: 20,
  },
  sideLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  sideLabelSelected: {
    color: INDIGO,
  },
  checkmark: {
    fontSize: 15,
    color: INDIGO,
    fontWeight: "700",
  },

  // Submit button
  submitBtn: {
    backgroundColor: INDIGO,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: INDIGO,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: "#c7d2fe",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
