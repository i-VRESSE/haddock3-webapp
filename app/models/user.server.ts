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
    return await api.registerRegisterAuthRegisterPost({
        userCreate: {
            email,
            password
        }
    });
}

export async function localLogin(username: string, password: string) {
    const api = buildAuthApi()
    const response = await api.authLocalLoginAuthJwtLoginPost({
        username,
        password
    })
    return response.accessToken
}

export async function getProfile(accessToken: string) {
    const api = buildUsersApi(accessToken)
    return await api.profileApiUsersProfileGet()
}

export async function oauthAuthorize(provider: string) {
    const api = buildAuthApi()
    let url: string;
    switch (provider) {
        case 'github':
            url = (await api.oauthGithubRemoteAuthorizeAuthGithubAuthorizeGet()).authorizationUrl;
            break;
        case 'orcid':
            url = (await api.oauthOrcidOrgRemoteAuthorizeAuthOrcidAuthorizeGet()).authorizationUrl;
            break;
        case 'orcidsandbox':
            url = (await api.oauthSandboxOrcidOrgRemoteAuthorizeAuthOrcidsandboxAuthorizeGet()).authorizationUrl;
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
            response = await api.oauthGithubRemoteCallbackAuthGithubCallbackGetRaw(request);
            break;
        case 'orcid':
            response = await api.oauthOrcidOrgRemoteCallbackAuthOrcidCallbackGetRaw(request)
            break;
        case 'orcidsandbox':
            response = await api.oauthSandboxOrcidOrgRemoteCallbackAuthOrcidsandboxCallbackGetRaw(request);
            break;
        default:
            throw new Error("Unknown provider");
    }
    const body = await response.raw.json();
    return body.access_token;
}

export async function getLevel(accessToken: string): Promise<string> {
    const me = await getCurrentUser(accessToken)
    const roles = new Set(me.roles);
    if (roles.has('haddock3:guru')) {
        return 'guru'
    } else if (roles.has('haddock3:expert')) {
        return 'expert'
    } else if (roles.has('haddock3:easy')) {
        return 'easy'
    }
    return ''
}

export async function getCurrentUser(accessToken: string) {
    const api = buildUsersApi(accessToken)
    return await api.usersCurrentUserUsersMeGet()
}

export async function listUsers(accessToken: string, limit = 100, offset = 0) {
    const api = buildUsersApi(accessToken)
    return await api.listUsersApiUsersGet({limit, offset})
}

export async function listRoles(accessToken: string) {
    const api = buildRolesApi(accessToken)
    return await api.listRolesApiRolesGet()
}

export async function setSuperUser(accessToken: string, userId: string, checked: boolean) {
    const api = buildUsersApi(accessToken)
    return await api.usersPatchUserUsersIdPatch({
        id: userId,
        userUpdate: {
            isSuperuser: checked
        }
    })
}

export async function grantRole(accessToken: string, userId: string, roleId: string) {
    const api = buildRolesApi(accessToken)
    api.grantRoleToUserApiRolesRoleIdUserIdPut({
        userId,
        roleId
    })
}

export async function revokeRole(accessToken: string, userId: string, roleId: string) {
    const api = buildRolesApi(accessToken)
    api.revokeRoleFromUserApiRolesRoleIdUserIdDelete({
        userId,
        roleId
    })
}
