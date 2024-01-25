import { type LoaderFunctionArgs } from "@remix-run/node";

import { getBartenderToken } from "~/bartender-client/token.server";
import { getJobStdout, jobIdFromParams } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const id = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  return await getJobStdout(id, token);
};
