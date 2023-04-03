import { useRouteLoaderData } from "@remix-run/react";

export function useIsAuthenticated() {
  const { isAuthenticated } = useRouteLoaderData("root") as {
    isAuthenticated?: boolean;
  };
  return isAuthenticated;
}

export function useIsSuperUser() {
  const { isSuperUser } = useRouteLoaderData("root") as {
    isSuperUser?: boolean;
  };
  return isSuperUser;
}
