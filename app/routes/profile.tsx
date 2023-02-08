import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAccessToken } from "~/cookies.server";
import { getProfile } from "~/models/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  const access_token = await getAccessToken(request);
  if (access_token === undefined) {
    throw new Error("Unauthenticated");
  }
  const profile = await getProfile(access_token)
  return json({ profile });
};

export default function JobPage() {
  const { profile } = useLoaderData<typeof loader>();
  return (
    <main>
      <p>Email: {profile.email}</p>
      <p>OAuth accounts: {profile.oauthAccounts.join(',')}</p>
      <Link to="/logout">Logout</Link>
    </main>
  );
}
