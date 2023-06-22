import { type LoaderArgs } from "@remix-run/node";
import { getOutputArchive } from "~/models/job.server";
import { getAccessToken } from "~/token.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const job_id = params.id || "";
  const access_token = await getAccessToken(request);
  if (access_token === undefined) {
    throw new Error("Unauthenticated");
  }
  return await getOutputArchive(parseInt(job_id), access_token);
};
