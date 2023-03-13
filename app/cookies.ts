import { useRouteLoaderData } from "@remix-run/react"

export function useIsAuthenticated() {
    const {accessToken } = useRouteLoaderData("root") as {accessToken?: string}
    return accessToken !== undefined
}

export function useIsSuperUser() {
    const {accessToken } = useRouteLoaderData("root") as {accessToken?: string}
    if (accessToken === undefined) {
        return false;
    }
    // TODO put isSuperUser into payload of token.
    // Alternativly call bartender endpoint to store users data in a remix session
    return true
}