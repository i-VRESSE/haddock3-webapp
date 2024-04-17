import { useMemo } from "react";
import { useMatches } from "@remix-run/react";

import type { TokenLessUser } from "./models/user.server";

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id: string) {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as Record<string, unknown> | undefined;
}

function isUser(user: unknown): user is TokenLessUser {
  return (
    !!user &&
    typeof user === "object" &&
    typeof (user as TokenLessUser).email === "string"
  );
}

export function useOptionalUser() {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser() {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function useIsAdmin(): boolean {
  const user = useOptionalUser();
  return user?.isAdmin ?? false;
}

export function useIsLoggedIn(): boolean {
  return !!useOptionalUser();
}

export function availableSocialLogins() {
  return Object.keys(process.env)
    .filter(
      (key) => key.startsWith("HADDOCK3WEBAPP_") && key.endsWith("_CLIENT_ID"),
    )
    .map((key) =>
      key
        .replace("HADDOCK3WEBAPP_", "")
        .replace("_CLIENT_ID", "")
        .toLowerCase(),
    );
}
