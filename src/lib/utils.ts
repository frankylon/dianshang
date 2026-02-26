export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${mins}min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}:${remMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getDivLabel(div: number): string {
  switch (div) {
    case 1: return "Champion Pick";
    case 2: return "Dark Horse";
    case 3: return "Rookie Trial";
    default: return `Div ${div}`;
  }
}

export function getDivReward(div: number): string | null {
  switch (div) {
    case 2: return "3% Credit Back";
    case 3: return "5% Credit Back";
    default: return null;
  }
}

export function getDivColor(div: number): string {
  switch (div) {
    case 1: return "text-div1 bg-div1/10 border-div1/30";
    case 2: return "text-div2 bg-div2/10 border-div2/30";
    case 3: return "text-div3 bg-div3/10 border-div3/30";
    default: return "text-muted bg-gray-100";
  }
}

export function getVarStatusLabel(status: string): string {
  switch (status) {
    case "clear": return "Clear";
    case "under_review": return "VAR Under Review";
    case "verified": return "VAR Verified";
    case "sanctioned": return "Sanctioned";
    default: return status;
  }
}

export function getSourceBadge(source: string): { label: string; className: string } {
  switch (source) {
    case "brand": return { label: "Brand", className: "bg-blue-100 text-blue-700" };
    case "user": return { label: "User", className: "bg-green-100 text-green-700" };
    case "evidence": return { label: "Evidence", className: "bg-purple-100 text-purple-700" };
    default: return { label: source, className: "bg-gray-100 text-gray-600" };
  }
}

export function parseTags(json: string | null | undefined): string[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}
