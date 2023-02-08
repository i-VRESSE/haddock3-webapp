import { AuthApi } from "~/bartender-client/apis/AuthApi";
import { buildConfig } from "./config.server";

function buildAuthApi(accessToken: string = '') {
    return new AuthApi(buildConfig(accessToken));
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
