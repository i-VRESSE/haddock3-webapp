import type { LoaderArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { UserTableRow } from "~/components/admin/UserTableRow";
import { getAccessToken } from "~/cookies.server";
import { listRoles, listUsers } from "~/models/user.server";

export async function loader({ request }: LoaderArgs) {
    const access_token =  await getAccessToken(request);
    if (access_token === undefined) {
        throw new Error("Unauthenticated");
      }
    const users = await listUsers(access_token)
    const roles = await listRoles(access_token)
    return json({
        users,roles
    });
  }


export default function AdminUsersPage() {
    const {users, roles} = useLoaderData<typeof loader>()
    const fetcher = useFetcher();
    return (
        <main>
            <h1 className="my-6 text-3xl">User admin</h1>
            <table className="table w-full">
                <thead>
        <tr>
            <th>Email</th>
            <th>Super user?</th>
            <th>Roles</th>
        </tr>
                </thead>
                <tbody>
            {users.map(user => {

                const update = (data: FormData) => {
                    fetcher.submit(data, {
                        method: 'post',
                        action: `/admin/users/${user.id}`
                    })
                }
                return (
                    <UserTableRow key={user.id} onUpdate={update} user={user} roles={roles}/>
                )
            })}
            </tbody>
            </table>
        </main>
    )
}