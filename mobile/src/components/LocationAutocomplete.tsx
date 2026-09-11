import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../api/client";
import { colors, fonts, radii, shadow, spacing } from "../theme";

type Prediction = { placeId: string; description: string };
export type Place = { name: string; lat: number; lng: number };

type Props = {
  placeholder: string;
  onSelect: (place: Place) => void;
};

// Address search box backed by the backend's /places proxy (Google Places
// Autocomplete + Details) — lets the user type an address and pick it from
// a dropdown instead of entering lat/lng by hand.
export default function LocationAutocomplete({ placeholder, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setPredictions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const requestId = ++requestIdRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get("/places/autocomplete", { params: { input: query } });
        if (requestIdRef.current === requestId) setPredictions(data);
      } catch {
        if (requestIdRef.current === requestId) setPredictions([]);
      } finally {
        if (requestIdRef.current === requestId) setSearching(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function pick(prediction: Prediction) {
    setOpen(false);
    setResolving(true);
    try {
      const { data } = await api.get("/places/details", { params: { placeId: prediction.placeId } });
      setQuery(data.name);
      onSelect(data);
    } finally {
      setResolving(false);
    }
  }

  return (
    <View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.ink300}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {(searching || resolving) && <ActivityIndicator size="small" color={colors.accent} />}
      </View>

      {open && predictions.length > 0 && (
        <View style={styles.dropdown}>
          {predictions.map((p, i) => (
            <TouchableOpacity
              key={p.placeId}
              style={[styles.option, i === predictions.length - 1 && styles.optionLast]}
              onPress={() => pick(p)}
            >
              <Text style={styles.optionText} numberOfLines={2}>
                {p.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  input: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.ink900, paddingVertical: 4 },
  dropdown: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: "hidden",
    ...shadow.card,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLast: { borderBottomWidth: 0 },
  optionText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink700 },
});
