import { type LoaderArgs } from "@remix-run/node";

import { getBartenderToken } from "~/bartender-client/token.server";
import { getInputArchive, jobIdFromParams } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  return await getInputArchive(id, token);
};
