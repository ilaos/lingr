import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#E8E8F0",
    buttonText: "#E8E8F0",
    tabIconDefault: "#6B6B7A",
    tabIconSelected: "#8B7FF5",
    link: "#8B7FF5",
    backgroundRoot: "#0A0A0F",
    backgroundDefault: "#151520",
    backgroundSecondary: "#1A1A25",
    backgroundTertiary: "#2A2A35",
    accent: "#8B7FF5",
    warning: "#FF6B6B",
    success: "#4ECDC4",
    dimmed: "#6B6B7A",
    border: "#2A2A35",
  },
  dark: {
    text: "#E8E8F0",
    buttonText: "#E8E8F0",
    tabIconDefault: "#6B6B7A",
    tabIconSelected: "#8B7FF5",
    link: "#8B7FF5",
    backgroundRoot: "#0A0A0F",
    backgroundDefault: "#151520",
    backgroundSecondary: "#1A1A25",
    backgroundTertiary: "#2A2A35",
    accent: "#8B7FF5",
    warning: "#FF6B6B",
    success: "#4ECDC4",
    dimmed: "#6B6B7A",
    border: "#2A2A35",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600" as const,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500" as const,
    letterSpacing: 1.5,
  },
  monospace: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  soft: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  floating: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  glow: {
    shadowColor: "#8B7FF5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  accentGlow: {
    shadowColor: "#8B7FF5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
};
