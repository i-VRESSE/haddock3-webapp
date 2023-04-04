import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { UserTableRow } from "~/components/admin/UserTableRow";
import { getAccessToken } from "~/token.server";
import {
  assignRole,
  listRoles,
  listUsers,
  setSuperUser,
  unassignRole,
} from "~/models/user.server";
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
  const users = await listUsers(accessToken);
  const roles = await listRoles(accessToken);
  return json({
    users,
    roles,
  });
}

export async function action({ request }: ActionArgs) {
  const accessToken = await getAccessToken(request);
  if (accessToken === undefined) {
    throw new Error("Unauthenticated");
  }
  const formData = await request.formData();
  const userId = formData.get("userId");
  if (userId === null || typeof userId !== "string") {
    throw new Error("Unknown user");
  }
  const isSuperuser = formData.get("isSuperuser");
  if (isSuperuser !== null) {
    setSuperUser(accessToken, userId, isSuperuser === "true");
  }
  const roles = await listRoles(accessToken);
  for (const role of roles) {
    const roleState = formData.get(role);
    if (roleState !== null) {
      if (roleState === "true") {
        assignRole(accessToken, userId, role);
      } else {
        unassignRole(accessToken, userId, role);
      }
    }
  }
  return json({ error: null, ok: true });
}

export default function AdminUsersPage() {
  const { users, roles } = useLoaderData<typeof loader>();
  const { submit, state } = useFetcher();
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
          {users.map((user) => {
            const update = (data: FormData) => {
              data.set("userId", user.id);
              submit(data, {
                method: "post",
              });
            };
            return (
              <UserTableRow
                key={user.id}
                submitting={state === "submitting"}
                onUpdate={update}
                user={user}
                roles={roles}
              />
            );
          })}
        </tbody>
      </table>
      <p>When roles or super is changed then the user should logout and login.</p>
    </main>
  );
}
