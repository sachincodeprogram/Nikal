// Shared design tokens — mirrors the Nikal design mockup (teal brand,
// Manrope type, soft neutral surfaces). Keep every screen's colors,
// spacing and radii sourced from here instead of one-off hex values.
export const colors = {
  accent: "#00857A",
  accentDark: "#00655C",
  accentTint: "#E3F3F1",
  accentTint2: "#CFEAE6",
  amber: "#F0A93B",
  amberDark: "#B4790C",
  amberTint: "#FCF1DF",
  danger: "#E5484D",
  dangerDark: "#B42318",
  dangerTint: "#FBEAEA",
  blue: "#3856C9",
  blueTint: "#EAEFFC",
  ink900: "#152220",
  ink700: "#3E4C49",
  ink500: "#6C7A78",
  ink400: "#8C9997",
  ink300: "#B7C1BF",
  ink200: "#DCE3E1",
  ink100: "#EEF3F1",
  bg: "#F5F8F7",
  surface: "#FFFFFF",
  border: "#E5EBE9",
  white: "#FFFFFF",
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };

export const radii = { sm: 9, md: 14, lg: 16, xl: 18, xxl: 22, pill: 999 };

export const fonts = {
  regular: "Manrope_500Medium",
  semibold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extrabold: "Manrope_800ExtraBold",
};

export const shadow = {
  card: {
    shadowColor: "#152220",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  button: {
    shadowColor: "#00857A",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
};
