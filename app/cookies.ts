import { useRouteLoaderData } from "@remix-run/react"

export function useIsAuthenticated() {
    const {access_token } = useRouteLoaderData("root") as {access_token?: string}
    return access_token !== undefined
}
