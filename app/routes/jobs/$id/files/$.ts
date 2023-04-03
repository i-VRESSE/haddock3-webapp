import { type LoaderArgs } from "@remix-run/node";
import { getAccessToken } from "~/token.server";
import {  getJobfile } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderArgs) => {
    const job_id = params.id || "";
    const path = params['*'] || "";
    const access_token = await getAccessToken(request)
    if (access_token === undefined) {
      throw new Error('Unauthenticated')
    }
    return await getJobfile(parseInt(job_id), path, access_token);
};
