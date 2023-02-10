import type { ActionArgs} from "@remix-run/node";
import { redirect } from "react-router";
import { oauthAuthorize } from "~/models/user.server";

export const action = async ({ params }: ActionArgs) => {
    const provider = params.provider || ''
    const url = await oauthAuthorize(provider)
    return redirect(url)
}