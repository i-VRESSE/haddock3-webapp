import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { mustBeAdmin } from "~/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await mustBeAdmin(request);
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
