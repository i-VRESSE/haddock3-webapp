import type { ApiResponse} from "~/bartender-client";
import { RolesApi} from "~/bartender-client";
import { UsersApi } from "~/bartender-client";
import { AuthApi } from "~/bartender-client/apis/AuthApi";
import { buildConfig } from "./config.server";

function buildAuthApi(accessToken: string = '') {
    return new AuthApi(buildConfig(accessToken));
}

function buildUsersApi(accessToken: string) {
    return new UsersApi(buildConfig(accessToken));
}

function buildRolesApi(accessToken: string) {
    return new RolesApi(buildConfig(accessToken));
}

export async function register(email: string, password: string) {
    const api = buildAuthApi()
    return await api.registerRegister({
        userCreate: {
            email,
            password
        }
    });
}

export async function localLogin(username: string, password: string) {
    const api = buildAuthApi()
    const response = await api.authLocalLogin({
        username,
        password
    })
    return response.accessToken
}

export async function getProfile(accessToken: string) {
    const api = buildUsersApi(accessToken)
    return await api.profile()
}

export async function oauthAuthorize(provider: string) {
    const api = buildAuthApi()
    let url: string;
    console.log("provider", JSON.stringify(provider))
    switch (provider) {
        case 'github':
            url = (await api.oauthGithubRemoteAuthorize()).authorizationUrl;
            break;
        case 'orcid':
            url = (await api.oauthOrcidOrgRemoteAuthorize()).authorizationUrl;
            break;
        case 'orcidsandbox':
            url = (await api.oauthSandboxOrcidOrgRemoteAuthorize()).authorizationUrl;
            break;
        case 'egi':
            url = (await api.oauthEGICheckinRemoteAuthorize()).authorizationUrl;
            break;
        default:
            throw new Error("Unknown provider");
    }
    return url;
}

export async function oauthCallback(provider: string, search: URLSearchParams) {
    const api = buildAuthApi()
    const request = {
        code: search.get('code') || undefined,
        codeVerifier: search.get('code_verifier') || undefined,
        state: search.get('state') || undefined,
        error: search.get('error') || undefined,
    }
    let response: ApiResponse<any>;
    switch (provider) {
        case 'github':
            response = await api.oauthGithubRemoteCallback(request);
            break;
        case 'orcid':
            response = await api.oauthOrcidOrgRemoteCallback(request)
            break;
        case 'orcidsandbox':
            response = await api.oauthSandboxOrcidOrgRemoteCallback(request);
            break;
        case 'egi':
            response = await api.oauthEGICheckinRemoteCallback(request);
            break;
        default:
            throw new Error("Unknown provider");
    }
    const body = await response.raw.json();
    return body.access_token;
}

export async function getLevel(userRoles: string[] | undefined): Promise<string> {
    if (!userRoles) {
        return ''
    }
    const roles = new Set(userRoles);
    if (roles.has('guru')) {
        return 'guru'
    } else if (roles.has('expert')) {
        return 'expert'
    } else if (roles.has('easy')) {
        return 'easy'
    }
    return ''
}

export function checkAuthenticated(accessToken : string | undefined) {
  if (accessToken === undefined) {
    throw new Error("Unauthenticated");
  }
}

export function isSubmitAllowed(level: string) {
    return level !== ''
}

export async function getCurrentUser(accessToken: string) {
    const api = buildUsersApi(accessToken)
    return await api.usersCurrentUser()
}

export async function listUsers(accessToken: string, limit = 100, offset = 0) {
    const api = buildUsersApi(accessToken)
    return await api.listUsers({limit, offset})
}

export async function listRoles(accessToken: string) {
    const api = buildRolesApi(accessToken)
    return await api.listRoles()
}

export async function setSuperUser(accessToken: string, userId: string, checked: boolean) {
    const api = buildUsersApi(accessToken)
    return await api.usersPatchUser({
        id: userId,
        userUpdate: {
            isSuperuser: checked
        }
    })
}

export async function assignRole(accessToken: string, userId: string, roleId: string) {
    const api = buildRolesApi(accessToken)
    api.assignRoleToUser({
        userId,
        roleId
    })
}

export async function unassignRole(accessToken: string, userId: string, roleId: string) {
    const api = buildRolesApi(accessToken)
    api.unassignRoleFromUser({
        userId,
        roleId
    })
}
