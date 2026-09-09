import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

// TODO(Firebase setup): replace this with real Firebase Phone Auth —
// send OTP to `phone`, let the user enter the code, get back an idToken,
// then call loginWithFirebaseToken(idToken, name). Until that's wired up,
// this screen can't actually authenticate; it exists so the rest of the
// navigation flow (Home, Search, Publish, Bookings, Profile) can be built
// and tested behind a logged-in state.
export default function LoginScreen() {
  const { loginWithFirebaseToken } = useAuth();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function sendOtp() {
    if (!phone.trim()) {
      Alert.alert("Phone number daaliye");
      return;
    }
    Alert.alert(
      "OTP not wired up yet",
      "Firebase Phone Auth is not configured yet — this is a placeholder flow."
    );
    setOtpSent(true);
  }

  async function verifyOtp() {
    setSubmitting(true);
    try {
      // Placeholder: once Firebase is wired, `otp` becomes the code sent to
      // the Firebase confirmation result, which returns a real idToken.
      await loginWithFirebaseToken(otp, name || undefined);
    } catch (err: any) {
      Alert.alert("Login failed", err?.response?.data?.error ?? err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nikal 🚗🏍️</Text>
      <Text style={styles.subtitle}>Carpool — Car ya Bike, apki marzi</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!otpSent}
      />

      {otpSent && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Naam (pehli baar)"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
        </>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={otpSent ? verifyOtp : sendOtp}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {otpSent ? "Verify & Login" : "Send OTP"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "700", textAlign: "center" },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#00857a",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
