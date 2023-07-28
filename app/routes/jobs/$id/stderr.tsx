import { type LoaderArgs } from "@remix-run/node";
import { getBartenderToken } from "~/bartender_token.server";
import { getJobStderr, jobIdFromParams } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  return await getJobStderr(id, token);
};
