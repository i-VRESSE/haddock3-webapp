import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getTokenPayload } from "~/token.server";
import { checkAuthenticated, getLevel, getProfile } from "~/models/user.server";
import { getSession } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request);
  const accessToken = session.data.bartenderToken;
  checkAuthenticated(accessToken);
  const profile = await getProfile(accessToken!)
  const tokenPayload = getTokenPayload(accessToken);
  const expireDate = tokenPayload.exp === undefined ? Date.now() : tokenPayload.exp * 1000;
  const level = await getLevel(session.data.roles);
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
