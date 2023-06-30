import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getTokenPayload } from "~/token.server";
import { checkAuthenticated, getLevel, getProfile } from "~/models/user.server";
import { getSession } from "~/session.server";
import { authenticator } from "~/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  let user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return json({ user });
};

export default function JobPage() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <main>
      <p>Email: {user.email}</p>
      {/* <p>Expertise level: {level}</p>
      <p>
        OAuth accounts:
        <ul>
          {profile.oauthAccounts.map((a) => (
            <li key={a.accountId}>
              {a.oauthName}: {a.accountEmail}
            </li>
          ))}
        </ul>
      </p>
      <p>Login expires: {new Date(expireDate).toISOString()}</p> */}
      <Link role="button" className="btn btn-sm" to="/logout">
        Logout
      </Link>
    </main>
  );
}
