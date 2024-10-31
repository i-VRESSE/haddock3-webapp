import { type LoaderFunctionArgs } from "@remix-run/node";

import { getBartenderToken } from "~/bartender-client/token.server";
import { getSubDirectoryAsArchive, jobIdFromParams } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const id = jobIdFromParams(params);
  const path = params["*"] || "";
  const token = await getBartenderToken(request);
  const filename = `haddock3-output-${id}-${path.replace(/\//g, "-")}.zip`;
  return await getSubDirectoryAsArchive(id, path, token, filename);
};
