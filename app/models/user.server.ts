import { ApiResponse, UsersApi } from "~/bartender-client";
import { AuthApi } from "~/bartender-client/apis/AuthApi";
import { buildConfig } from "./config.server";

function buildAuthApi(accessToken: string = '') {
    return new AuthApi(buildConfig(accessToken));
}

function buildUsersApi(accessToken: string) {
    return new UsersApi(buildConfig(accessToken));
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
        case 'orcidsandbox':
            url = (await api.oauthGithubRemoteCallbackAuthGithubCallbackGet()).authorizationUrl;
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
    console.log(provider)
    switch (provider) {
        case 'github':
            response = await api.oauthGithubRemoteCallbackAuthGithubCallbackGetRaw(request);
            break;
        // TODO regenerate bartender-client when bartender has orcid login configured
        // case 'orcid':
        //     response = await api.oauthSandboxOrcidOrgRemoteCallbackAuthOrcidsandboxCallbackGetRaw(request)
        //     break;
        case 'orcidsandbox':
            response = await api.oauthSandboxOrcidOrgRemoteCallbackAuthOrcidsandboxCallbackGetRaw(request);
            break;
        default:
            throw new Error("Unknown provider");
    }
    const body = await response.raw.json();
    return body.access_token;
}