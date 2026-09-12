import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BikeIcon, CarIcon, ChevronRightIcon, ClockIcon, ShieldCheckIcon, StarIcon } from "../components/icons";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, shadow, spacing } from "../theme";
import { User, Vehicle } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "RideResults">;

const AVATAR_COLORS = [colors.accent, colors.blue, colors.amberDark, colors.danger];

function initialsOf(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function RideResultsScreen({ route, navigation }: Props) {
  const { rides } = route.params;

  if (rides.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Koi ride nahi mili is route/date par.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={rides}
      keyExtractor={(r) => r._id}
      renderItem={({ item, index }) => {
        const driver = item.driverId as User | undefined;
        const vehicle = item.vehicleId as Vehicle | undefined;
        const isBike = vehicle?.type === "BIKE";
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("RideDetail", { rideId: item._id })}
            activeOpacity={0.75}
          >
            <View style={styles.rowBetween}>
              <View style={styles.routeRow}>
                <View style={[styles.vehicleBadge, { backgroundColor: isBike ? colors.amberTint : colors.accentTint }]}>
                  {isBike ? <BikeIcon size={17} color={colors.amberDark} /> : <CarIcon size={17} color={colors.accentDark} />}
                </View>
                <Text style={styles.route} numberOfLines={1}>
                  {item.from.name} → {item.to.name}
                </Text>
              </View>
              <ChevronRightIcon size={17} color={colors.ink300} />
            </View>

            <View style={styles.metaRow}>
              <ClockIcon size={13} color={colors.ink400} />
              <Text style={styles.metaText}>
                {new Date(item.departureAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                {item.totalKm ? `  ·  ${item.totalKm.toFixed(1)} km` : ""}
              </Text>
            </View>

            <View style={styles.hr} />

            <View style={styles.rowBetween}>
              <View style={styles.driverRow}>
                <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[(driver?.name?.length ?? 0) % AVATAR_COLORS.length] }]}>
                  <Text style={styles.avatarText}>{initialsOf(driver?.name)}</Text>
                </View>
                <Text style={styles.driverName}>{driver?.name ?? "Driver"}</Text>
                {driver?.isVerified && <ShieldCheckIcon size={13} color={colors.accent} />}
                <View style={styles.ratingRow}>
                  <StarIcon size={12} />
                  <Text style={styles.ratingText}>{driver?.avgRating?.toFixed(1) ?? "—"}</Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.price}>₹{Math.round(item.passengerFare ?? item.pricePerSeat)}</Text>
                <Text style={styles.seats}>{item.seatsLeft} seats left</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.bg },
  listContent: { padding: spacing.xl, gap: spacing.md },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  emptyText: { fontFamily: fonts.semibold, color: colors.ink500 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, marginRight: spacing.sm },
  vehicleBadge: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  route: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink900, flexShrink: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  metaText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink500 },
  hr: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  driverRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.extrabold, fontSize: 10, color: colors.white },
  driverName: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink900 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink500 },
  price: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.accentDark },
  seats: { fontFamily: fonts.semibold, fontSize: 10.5, color: colors.ink500, marginTop: 1 },
});
