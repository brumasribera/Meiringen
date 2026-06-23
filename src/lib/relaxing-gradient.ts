const relaxingGradients = [
  "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_transparent_34%),linear-gradient(135deg,#eef2ff_0%,#dbeafe_42%,#d1fae5_100%)]",
  "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.8),_transparent_32%),linear-gradient(135deg,#f5f3ff_0%,#e0f2fe_48%,#ecfccb_100%)]",
  "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.82),_transparent_30%),linear-gradient(135deg,#ecfeff_0%,#dbeafe_46%,#fef3c7_100%)]",
  "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.82),_transparent_34%),linear-gradient(135deg,#f0fdf4_0%,#ccfbf1_46%,#dbeafe_100%)]",
  "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.78),_transparent_33%),linear-gradient(135deg,#fff7ed_0%,#e0f2fe_44%,#f8fafc_100%)]",
] as const;

function hashString(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  return hash;
}

export function getRelaxingGradientClass(seed: string): string {
  if (!seed) return relaxingGradients[0];

  return relaxingGradients[hashString(seed) % relaxingGradients.length];
}
