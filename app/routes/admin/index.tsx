import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { getSession } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  const accessToken = session.data.bartenderToken;
  if (accessToken === undefined) {
    throw new Error("Unauthenticated");
  }
  if (!session.data.isSuperUser) {
    throw new Error("Forbidden");
  }
  return json({});
}

export default function AdminIndexPage() {
  return (
    <main>
      <h1 className="my-6 text-3xl">Admin</h1>
      <ul>
        <li>
          <Link to="/admin/users">Users</Link>
        </li>
      </ul>
    </main>
  );
}
