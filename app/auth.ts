import { useMatches } from "@remix-run/react";
import type { User } from "./models/user.server";
import { useMemo } from "react";

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function useIsAdmin(): boolean {
  const user = useOptionalUser();
  return !!user?.roles.find((role) => role.name === "admin");
}

export function useIsLoggedIn(): boolean {
  return !!useOptionalUser();
}

export function availableSocialLogins() {
  return Object.keys(process.env)
    .filter(
      (key) => key.startsWith("HADDOCK3WEBAPP_") && key.endsWith("_CLIENT_ID")
    )
    .map((key) =>
      key.replace("HADDOCK3WEBAPP_", "").replace("_CLIENT_ID", "").toLowerCase()
    );
}
