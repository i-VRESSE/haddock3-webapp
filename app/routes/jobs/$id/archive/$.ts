import { type LoaderArgs } from "@remix-run/node";
import { getAccessToken } from "~/token.server";
import { getSubDirectoryAsArchive } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const job_id = params.id || "";
  const path = params["*"] || "";
  const accessToken = await getAccessToken(request);
  if (accessToken === undefined) {
    throw new Error("Unauthenticated");
  }

  return await getSubDirectoryAsArchive(parseInt(job_id), path, accessToken);
};
