const relaxingGradients = [
  {
    className:
      "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.78),_transparent_28%),linear-gradient(135deg,#f97316_0%,#fb7185_45%,#38bdf8_100%)]",
    textClass: "text-white",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.76),_transparent_30%),linear-gradient(135deg,#1d4ed8_0%,#7c3aed_46%,#f59e0b_100%)]",
    textClass: "text-white",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.80),_transparent_30%),linear-gradient(135deg,#0f766e_0%,#14b8a6_44%,#fde047_100%)]",
    textClass: "text-slate-950",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.74),_transparent_32%),linear-gradient(135deg,#111827_0%,#334155_42%,#94a3b8_100%)]",
    textClass: "text-white",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.76),_transparent_30%),linear-gradient(135deg,#be123c_0%,#ec4899_42%,#facc15_100%)]",
    textClass: "text-white",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.74),_transparent_28%),linear-gradient(135deg,#0ea5e9_0%,#22c55e_46%,#eab308_100%)]",
    textClass: "text-slate-950",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.76),_transparent_30%),linear-gradient(135deg,#8b5cf6_0%,#06b6d4_44%,#f97316_100%)]",
    textClass: "text-white",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.78),_transparent_31%),linear-gradient(135deg,#14532d_0%,#16a34a_43%,#bef264_100%)]",
    textClass: "text-white",
  },
] as const;

function hashString(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  return hash;
}

export function getRelaxingGradient(seed: string) {
  if (!seed) return relaxingGradients[0];

  return relaxingGradients[hashString(seed) % relaxingGradients.length];
}

export function getRelaxingGradientClass(seed: string): string {
  return getRelaxingGradient(seed).className;
}

export function getRelaxingGradientTextClass(seed: string): string {
  return getRelaxingGradient(seed).textClass;
}
