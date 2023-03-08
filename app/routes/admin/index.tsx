import type { LoaderArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { getAccessToken } from "~/cookies.server";
import { getCurrentUser } from "~/models/user.server";

export async function loader({ request }: LoaderArgs) {
    const access_token =  await getAccessToken(request);
    if (access_token === undefined) {
        throw new Error("Unauthenticated");
      }
    const { isSuperuser, roles} = await getCurrentUser(access_token)
    if (!isSuperuser) {
        throw new Error("Forbidden");
    }
    return json({
        isSuperuser, roles
    });
  }

export default function AdminIndexPage() {
    return (
        <main>
            <h1 className="my-6 text-3xl">Admin</h1>
            <ul>
                <li><Link to="/admin/users">Users</Link></li>
            </ul>
        </main>
    )
}