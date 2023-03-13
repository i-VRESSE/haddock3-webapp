import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAccessToken, getTokenPayload } from "~/cookies.server";
import { getLevel, getProfile } from "~/models/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  const accessToken = await getAccessToken(request);
  if (accessToken === undefined) {
    throw new Error("Unauthenticated");
  }
  const profile = await getProfile(accessToken)
  const tokenPayload = getTokenPayload(accessToken);
  const expireDate = tokenPayload.exp === undefined ? Date.now() : tokenPayload.exp * 1000;
  const level = await getLevel(accessToken);
  return json({ profile, expireDate, level });
};

export default function JobPage() {
  const { profile, expireDate, level } = useLoaderData<typeof loader>();
  return (
    <main>
      <p>Email: {profile.email}</p>
      <p>Expertise level: {level}</p>
      <p>OAuth accounts: 
        <ul>
          {profile.oauthAccounts.map(a => <li key={a.accountId}>{a.oauthName}: {a.accountEmail}</li>)}
        </ul>
      </p>
      <p>Login expires: {new Date(expireDate).toISOString()}</p>
      <Link role="button" className="btn btn-sm" to="/logout">Logout</Link>
    </main>
  );
}
