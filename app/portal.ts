import { useMatchesData } from "./auth";

export function useInPortalMode(): boolean {
  const data = useMatchesData("root");
  return !!data?.inPortalMode;
}
