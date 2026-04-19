// Brand Theme Palette (AI Job Assistant)
export const theme = {
  // 🌈 Gradients
  gradientText:
    "bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent",
  gradientBg:
    "from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10",

  // 🎨 Core Brand Colors
  indigo: {
    light: "#818CF8", // indigo-400
    base: "#6366F1",  // indigo-500
    dark: "#4F46E5",  // indigo-600
  },
  violet: {
    light: "#A78BFA", // violet-400
    base: "#8B5CF6",  // violet-500
    dark: "#7C3AED",  // violet-600
  },
  fuchsia: {
    light: "#F0ABFC", // fuchsia-300
    base: "#E879F9",  // fuchsia-400
    dark: "#C026D3",  // fuchsia-600
  },
  emerald: {
    base: "#10B981", // emerald-500
  },

  // ⚪ Neutral UI
  gray: {
    light: "#F9FAFB", // gray-50
    base: "#E5E7EB",  // gray-200
    dark: "#374151",  // gray-700
  },
  slate: {
    text: "#0F172A", // slate-900
    secondary: "#64748B", // slate-500
  },

  // 💎 Shadows & Effects
  shadow: {
    soft: "0 4px 20px rgba(99, 102, 241, 0.15)", // indigo glow
    card: "0 6px 24px rgba(124, 58, 237, 0.12)", // violet glow
  },

  // 🧊 Glass & Surface
  glass: {
    background: "rgba(255,255,255,0.8)",
    border: "rgba(124,58,237,0.2)",   // violet tint
    blur: "blur(10px)",
  },

  // 💡 Accent Gradients
  buttonGradient:
    "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-fuchsia-500",
  softBadge:
    "inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700",
};
