import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import {
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
} from "firebase/auth";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowRightIcon, BikeIcon, CarIcon, PhoneIcon, RouteMarkIcon, ShieldCheckIcon } from "../components/icons";
import { firebaseApp, firebaseConfig } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { colors, fonts, radii, shadow, spacing } from "../theme";

const auth = getAuth(firebaseApp);

export default function LoginScreen() {
  const { loginWithFirebaseToken } = useAuth();
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function sendOtp() {
    if (!phone.trim().startsWith("+")) {
      Alert.alert("Phone number country code ke saath daaliye, e.g. +919999999999");
      return;
    }
    setSending(true);
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone.trim(),
        recaptchaVerifier.current!
      );
      setVerificationId(confirmation.verificationId);
      setOtpSent(true);
    } catch (err: any) {
      Alert.alert("OTP send nahi hua", err.message);
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp() {
    if (!verificationId) return;
    setSubmitting(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);
      const idToken = await userCredential.user.getIdToken();
      await loginWithFirebaseToken(idToken, name || undefined);
    } catch (err: any) {
      Alert.alert("Login failed", err?.response?.data?.message ?? err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseConfig} />

      <View style={styles.blobLarge} />
      <View style={styles.blobSmall} />

      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <RouteMarkIcon size={26} color={colors.white} />
        </View>
        <Text style={styles.title}>Nikal</Text>
        <Text style={styles.subtitle}>Carpool — Car ya Bike, apki marzi</Text>

        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <CarIcon size={16} color={colors.accent} />
            <Text style={styles.pillText}>Car</Text>
          </View>
          <View style={styles.pill}>
            <BikeIcon size={16} color={colors.accent} />
            <Text style={styles.pillText}>Bike</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Phone number</Text>
        <View style={styles.inputRow}>
          <PhoneIcon size={18} color={colors.ink500} />
          <TextInput
            style={styles.input}
            placeholder="+919999999999"
            placeholderTextColor={colors.ink300}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={!otpSent}
          />
        </View>

        {otpSent && (
          <>
            <View style={[styles.inputRow, { marginTop: spacing.md }]}>
              <TextInput
                style={styles.input}
                placeholder="Naam (pehli baar)"
                placeholderTextColor={colors.ink300}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={[styles.inputRow, { marginTop: spacing.md }]}>
              <TextInput
                style={styles.input}
                placeholder="OTP"
                placeholderTextColor={colors.ink300}
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={otpSent ? verifyOtp : sendOtp}
          disabled={submitting || sending}
        >
          {submitting || sending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.buttonText}>{otpSent ? "Verify & Login" : "Send OTP"}</Text>
              <ArrowRightIcon size={17} color={colors.white} />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.helper}>We'll text a 6-digit code to verify it's you</Text>
      </View>

      <View style={styles.trustRow}>
        <ShieldCheckIcon size={15} color={colors.accent} />
        <Text style={styles.trustText}>Verified drivers, every ride</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  blobLarge: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.accentTint,
  },
  blobSmall: {
    position: "absolute",
    top: 60,
    left: -70,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.accentTint2,
    opacity: 0.55,
  },
  hero: { paddingTop: 68, paddingHorizontal: spacing.xxl, alignItems: "center" },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    ...shadow.button,
  },
  title: { fontFamily: fonts.extrabold, fontSize: 30, color: colors.ink900, letterSpacing: -0.5 },
  subtitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink500, marginTop: 4 },
  pillRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink700 },
  card: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxxl,
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    ...shadow.card,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.ink500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink900,
  },
  button: {
    flexDirection: "row",
    marginTop: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 15,
    ...shadow.button,
  },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
  helper: {
    marginTop: spacing.md,
    textAlign: "center",
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.ink500,
  },
  trustRow: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  trustText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink500 },
});
