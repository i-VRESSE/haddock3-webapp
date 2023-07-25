import { json, type LoaderArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { useUser } from "~/auth";

export const loader = async ({ request }: LoaderArgs) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return json({});
};

export default function JobPage() {
  const user = useUser();
  return (
    <main>
      <p>Email: {user.email}</p>
      <p>
        Roles:&nbsp;
        {user.roles.length ? (
          <ul className="list-inside list-disc">
            {user.roles.map((role) => (
              <li key={role.name}>{role.name}</li>
            ))}
          </ul>
        ) : (
          <span>None</span>
        )}
      </p>
      <Link role="button" className="btn btn-sm" to="/logout">
        Logout
      </Link>
    </main>
  );
}
