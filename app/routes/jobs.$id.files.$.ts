import { type LoaderArgs } from "@remix-run/node";

import { getBartenderToken } from "~/bartender-client/token.server";
import { getJobfile, jobIdFromParams } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = jobIdFromParams(params);
  const path = params["*"] || "";
  const token = await getBartenderToken(request);
  return await getJobfile(id, path, token);
};
