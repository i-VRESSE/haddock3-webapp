import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { checkAuthenticated } from "~/models/user.server";
import { getSession } from "~/session.server";
import { url } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  const accessToken = session.data.bartenderToken;
  checkAuthenticated(accessToken);
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
          <Link to={url("/admin/users")}>Users</Link>
        </li>
      </ul>
    </main>
  );
}
