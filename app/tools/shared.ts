export function shouldShowInteractiveVersion(
  url: string,
  hasInteractiveVersion: boolean,
) {
  const wantInteractiveVersion = new URL(url).searchParams.get("i");
  if (wantInteractiveVersion === null && hasInteractiveVersion) {
    return true;
  } else if (wantInteractiveVersion === "0" && hasInteractiveVersion) {
    return false;
  } else if (wantInteractiveVersion === "1" && hasInteractiveVersion) {
    return true;
  }
  return false;
}
