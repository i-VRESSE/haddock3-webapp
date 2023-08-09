import { type LoaderArgs } from "@remix-run/node";
import { getInputArchive, jobIdFromParams } from "~/models/job.server";
import { getBartenderToken } from "~/bartender_token.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  return await getInputArchive(id, token);
};
