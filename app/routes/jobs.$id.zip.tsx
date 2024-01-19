import { type LoaderArgs } from "@remix-run/node";
import { getArchive, jobIdFromParams } from "~/models/job.server";
import { getBartenderToken } from "~/bartender-client/token.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  return await getArchive(id, token);
};
