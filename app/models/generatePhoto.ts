function generateInitials(email: string): string {
  const names = email.split("@")[0].split(".");
  const initials = names.map((name) => name[0].toUpperCase());
  return initials.join("");
}

export function generatePhoto(
  email: string,
  bg = "#F2F3F9",
  fg = "#4177C1",
): string {
  // Default foreground and background colors are from tailwind.config.js
  const initials = generateInitials(email);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="${bg}"/>
      <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="40" font-weight="bold" fill="${fg}">${initials}</text>
    </svg>
  `;
  const svgData = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=UTF-8,${svgData}`;
}
