import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import {
  BikeIcon,
  CameraIcon,
  CarIcon,
  IdCardIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  StarIcon,
} from "../components/icons";
import DigilockerModal, { DigilockerResult } from "../components/DigilockerModal";
import { useAuth } from "../context/AuthContext";
import { colors, fonts, radii, shadow, spacing } from "../theme";
import { KycDocType, Vehicle, VehicleType } from "../types";
import { pickAndUploadImage } from "../utils/uploadImage";

const DOC_TYPES: { key: KycDocType; label: string }[] = [
  { key: "aadhaar", label: "Aadhaar" },
  { key: "driving_license", label: "Driving Licence" },
  { key: "passport", label: "Passport" },
  { key: "voter_id", label: "Voter ID" },
];

export default function ProfileScreen() {
  const { user, refreshMe } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [type, setType] = useState<VehicleType>("CAR");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [seats, setSeats] = useState("4");
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);
  const [vehiclePhotoUploading, setVehiclePhotoUploading] = useState(false);

  const [docType, setDocType] = useState<KycDocType>("aadhaar");
  const [docNumber, setDocNumber] = useState("");
  const [docPhoto, setDocPhoto] = useState<string | null>(null);
  const [docPhotoUploading, setDocPhotoUploading] = useState(false);
  const [kycSubmitting, setKycSubmitting] = useState(false);

  const [digilockerUrl, setDigilockerUrl] = useState<string | null>(null);
  const [digilockerStarting, setDigilockerStarting] = useState(false);
  const [digilockerConfirming, setDigilockerConfirming] = useState(false);

  function loadVehicles() {
    api.get("/vehicles").then(({ data }) => setVehicles(data));
  }

  useEffect(loadVehicles, []);

  async function changeProfilePhoto() {
    const url = await pickAndUploadImage(`users/${user?._id}/profile`, setPhotoUploading);
    if (!url) return;
    try {
      await api.put("/users/me", { photo: url });
      await refreshMe();
    } catch (err: any) {
      Alert.alert("Photo save nahi hui", err?.response?.data?.message ?? err.message);
    }
  }

  async function addVehicle() {
    if (!make.trim() || !model.trim() || !plateNo.trim()) {
      Alert.alert("Make, model aur plate number bharo");
      return;
    }
    try {
      await api.post("/vehicles", {
        type,
        make,
        model,
        color,
        plateNo,
        seats: Number(seats),
        photo: vehiclePhoto ?? undefined,
      });
      setShowAdd(false);
      setMake("");
      setModel("");
      setColor("");
      setPlateNo("");
      setVehiclePhoto(null);
      loadVehicles();
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message ?? err.message);
    }
  }

  function openAddVehicle() {
    if (user?.kyc?.status !== "verified") {
      Alert.alert(
        "KYC bhi kar lo",
        "Vehicle verified tab dikhegi jab tumhari KYC bhi verify ho jaye. Neeche 'Identity Verification (KYC)' section me kar sakte ho — abhi vehicle add karna continue kar sakte ho.",
        [{ text: "OK, continue" }]
      );
    }
    setShowAdd(true);
  }

  async function pickDocPhoto() {
    const url = await pickAndUploadImage(`users/${user?._id}/kyc`, setDocPhotoUploading);
    if (url) setDocPhoto(url);
  }

  async function pickVehiclePhoto() {
    const url = await pickAndUploadImage(`vehicles/${user?._id}`, setVehiclePhotoUploading);
    if (url) setVehiclePhoto(url);
  }

  async function submitKyc() {
    if (!docNumber.trim()) {
      Alert.alert("Document number daalo");
      return;
    }
    if (!docPhoto) {
      Alert.alert("Document ki photo lagao");
      return;
    }
    setKycSubmitting(true);
    try {
      await api.post("/users/me/kyc", { docType, docNumber: docNumber.trim(), docPhoto });
      await refreshMe();
      setDocNumber("");
      setDocPhoto(null);
    } catch (err: any) {
      Alert.alert("Submit nahi hua", err?.response?.data?.message ?? err.message);
    } finally {
      setKycSubmitting(false);
    }
  }

  async function startDigilocker() {
    setDigilockerStarting(true);
    try {
      const { data } = await api.post("/users/me/kyc/digilocker/start");
      setDigilockerUrl(data.url);
    } catch (err: any) {
      Alert.alert("DigiLocker shuru nahi hua", err?.response?.data?.message ?? err.message);
    } finally {
      setDigilockerStarting(false);
    }
  }

  async function onDigilockerResult(result: DigilockerResult) {
    setDigilockerUrl(null);
    if (!result.success || !result.id) {
      if (result.errMessage) Alert.alert("DigiLocker verification cancel hui", result.errMessage);
      return;
    }
    setDigilockerConfirming(true);
    try {
      await api.post("/users/me/kyc/digilocker/confirm", { id: result.id });
      await refreshMe();
      Alert.alert("Verified!", "DigiLocker se tumhari identity verify ho gayi.");
    } catch (err: any) {
      Alert.alert("Confirm nahi hua", err?.response?.data?.message ?? err.message);
    } finally {
      setDigilockerConfirming(false);
    }
  }

  const kycStatus = user?.kyc?.status ?? "unsubmitted";

  return (
    <>
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.container}
      data={vehicles}
      keyExtractor={(v) => v._id}
      ListHeaderComponent={
        <>
          <View style={styles.userRow}>
            <TouchableOpacity onPress={changeProfilePhoto} disabled={photoUploading} style={styles.avatarWrap}>
              {user?.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(user?.name ?? "?").charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.avatarCameraBadge}>
                {photoUploading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <CameraIcon size={13} color={colors.white} />
                )}
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{user?.name}</Text>
                {user?.isVerified && <ShieldCheckIcon size={16} color={colors.accent} />}
              </View>
              <Text style={styles.phone}>{user?.phone ?? user?.email}</Text>
              <View style={styles.ratingRow}>
                <StarIcon size={14} />
                <Text style={styles.ratingText}>
                  {user?.avgRating?.toFixed(1) ?? "0.0"} · {user?.ratingCount ?? 0} reviews
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Identity Verification (KYC)</Text>
          <View style={styles.kycCard}>
            {kycStatus === "verified" && (
              <View style={styles.kycStateRow}>
                <ShieldCheckIcon size={20} color={colors.accent} />
                <Text style={styles.kycVerifiedText}>KYC verified — verified badge sabko dikh raha hai.</Text>
              </View>
            )}

            {kycStatus === "pending" && (
              <View style={styles.kycStateRow}>
                <IdCardIcon size={20} color={colors.amberDark} />
                <Text style={styles.kycPendingText}>
                  Submit ho gaya — admin review kar raha hai. Thodi der me verified ho jayega.
                </Text>
              </View>
            )}

            {(kycStatus === "unsubmitted" || kycStatus === "rejected") && (
              <>
                {kycStatus === "rejected" && (
                  <Text style={styles.kycRejectedText}>
                    Reject ho gaya tha: {user?.kyc?.rejectionReason || "Documents clear nahi the"}. Dobara try karo.
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.digilockerButton}
                  onPress={startDigilocker}
                  disabled={digilockerStarting || digilockerConfirming}
                >
                  {digilockerStarting || digilockerConfirming ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <IdCardIcon size={17} color={colors.white} />
                      <Text style={styles.digilockerButtonText}>Verify instantly via DigiLocker</Text>
                    </>
                  )}
                </TouchableOpacity>
                <Text style={styles.digilockerHint}>
                  Aadhaar-linked mobile OTP se turant verify — koi photo upload ya wait nahi.
                </Text>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>YA MANUALLY</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Text style={styles.kycHelper}>
                  Ek government ID lagao (Aadhaar, DL, Passport, ya Voter ID) — admin review karega.
                </Text>
                <View style={styles.chipRow}>
                  {DOC_TYPES.map((d) => {
                    const active = docType === d.key;
                    return (
                      <TouchableOpacity
                        key={d.key}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => setDocType(d.key)}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{d.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Document number"
                  placeholderTextColor={colors.ink300}
                  value={docNumber}
                  onChangeText={setDocNumber}
                />
                <TouchableOpacity style={styles.photoPickRow} onPress={pickDocPhoto} disabled={docPhotoUploading}>
                  {docPhoto ? (
                    <Image source={{ uri: docPhoto }} style={styles.photoPickThumb} />
                  ) : (
                    <View style={[styles.photoPickThumb, styles.photoPickPlaceholder]}>
                      {docPhotoUploading ? (
                        <ActivityIndicator color={colors.accent} />
                      ) : (
                        <CameraIcon size={18} color={colors.ink500} />
                      )}
                    </View>
                  )}
                  <Text style={styles.photoPickText}>{docPhoto ? "Photo badlo" : "Document ki photo lagao"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={submitKyc} disabled={kycSubmitting}>
                  {kycSubmitting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.buttonText}>Submit for Verification</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.sectionLabel}>My Vehicles</Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.vehicleCard}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.vehicleBadgeImage} />
          ) : (
            <View style={[styles.vehicleBadge, { backgroundColor: item.type === "BIKE" ? colors.amberTint : colors.accentTint }]}>
              {item.type === "BIKE" ? (
                <BikeIcon size={21} color={colors.amberDark} />
              ) : (
                <CarIcon size={21} color={colors.accentDark} />
              )}
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.vehicleName}>
                {item.make} {item.model} {item.color ? `· ${item.color}` : ""}
              </Text>
              {item.verified && <ShieldCheckIcon size={13} color={colors.accent} />}
            </View>
            <View style={styles.vehicleMetaRow}>
              <Text style={styles.plateChip}>{item.plateNo}</Text>
              <Text style={styles.seatText}>{item.seats} seats</Text>
              {!item.verified && <Text style={styles.pendingText}>Verification pending</Text>}
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.dim}>Koi vehicle nahi</Text>}
      ListFooterComponent={
        showAdd ? (
          <View style={styles.form}>
            <View style={styles.chipRow}>
              {(["CAR", "BIKE"] as VehicleType[]).map((t) => {
                const active = type === t;
                return (
                  <TouchableOpacity key={t} style={[styles.chip, active && styles.chipActive]} onPress={() => setType(t)}>
                    {t === "CAR" ? (
                      <CarIcon size={16} color={active ? colors.white : colors.accent} />
                    ) : (
                      <BikeIcon size={16} color={active ? colors.white : colors.accent} />
                    )}
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t === "CAR" ? "Car" : "Bike"}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput style={styles.input} placeholder="Make (e.g. Maruti)" placeholderTextColor={colors.ink300} value={make} onChangeText={setMake} />
            <TextInput style={styles.input} placeholder="Model (e.g. Swift)" placeholderTextColor={colors.ink300} value={model} onChangeText={setModel} />
            <TextInput style={styles.input} placeholder="Color" placeholderTextColor={colors.ink300} value={color} onChangeText={setColor} />
            <TextInput style={styles.input} placeholder="Plate number" placeholderTextColor={colors.ink300} value={plateNo} onChangeText={setPlateNo} />
            <TextInput
              style={styles.input}
              placeholder="Seats (driver ke alawa)"
              placeholderTextColor={colors.ink300}
              keyboardType="number-pad"
              value={seats}
              onChangeText={setSeats}
            />
            <TouchableOpacity style={styles.photoPickRow} onPress={pickVehiclePhoto} disabled={vehiclePhotoUploading}>
              {vehiclePhoto ? (
                <Image source={{ uri: vehiclePhoto }} style={styles.photoPickThumb} />
              ) : (
                <View style={[styles.photoPickThumb, styles.photoPickPlaceholder]}>
                  {vehiclePhotoUploading ? (
                    <ActivityIndicator color={colors.accent} />
                  ) : (
                    <CameraIcon size={18} color={colors.ink500} />
                  )}
                </View>
              )}
              <Text style={styles.photoPickText}>{vehiclePhoto ? "Photo badlo" : "Vehicle ki photo lagao"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={addVehicle}>
              <Text style={styles.buttonText}>Save Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={openAddVehicle}>
            <PlusCircleIcon size={18} color={colors.ink700} />
            <Text style={styles.addButtonText}>Add Vehicle</Text>
          </TouchableOpacity>
        )
      }
    />
    <DigilockerModal
      visible={!!digilockerUrl}
      url={digilockerUrl}
      onResult={onDigilockerResult}
      onClose={() => setDigilockerUrl(null)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingTop: spacing.xxl },
  userRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.ink100 },
  avatarCameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.ink700,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.white },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontFamily: fonts.extrabold, fontSize: 19, color: colors.ink900 },
  phone: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink500, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  ratingText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.ink900 },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.ink500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  kycCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadow.card,
  },
  kycStateRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  kycVerifiedText: { flex: 1, fontFamily: fonts.bold, fontSize: 13, color: colors.accentDark },
  kycPendingText: { flex: 1, fontFamily: fonts.bold, fontSize: 13, color: colors.amberDark },
  kycRejectedText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.dangerDark, marginBottom: spacing.md },
  kycHelper: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink500, marginBottom: spacing.md },
  digilockerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.blue,
    borderRadius: radii.md,
    paddingVertical: 14,
  },
  digilockerButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
  digilockerHint: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.ink500,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontFamily: fonts.bold, fontSize: 10.5, color: colors.ink400, letterSpacing: 0.5 },
  photoPickRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  photoPickThumb: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.ink100 },
  photoPickPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  photoPickText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink700 },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  vehicleBadge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  vehicleBadgeImage: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.ink100 },
  vehicleName: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink900 },
  vehicleMetaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 4, flexWrap: "wrap" },
  plateChip: {
    fontFamily: fonts.extrabold,
    fontSize: 10.5,
    letterSpacing: 0.3,
    color: colors.ink700,
    backgroundColor: colors.ink100,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  seatText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink500 },
  pendingText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.amberDark },
  dim: { fontFamily: fonts.semibold, color: colors.ink500, fontSize: 13 },
  form: { marginTop: spacing.sm },
  chipRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink700 },
  chipTextActive: { color: colors.white },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    marginBottom: spacing.md,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.ink900,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 15,
    alignItems: "center",
    ...shadow.button,
  },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radii.md,
    paddingVertical: 14,
  },
  addButtonText: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.ink700 },
});
