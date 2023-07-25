import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { UserTableRow } from "~/components/admin/UserTableRow";
import {
  assignRole,
  listRoles,
  listUsers,
  unassignRole,
} from "~/models/user.server";
import { mustBeAdmin } from "~/auth.server";

export async function loader({ request }: LoaderArgs) {
  await mustBeAdmin(request);
  const users = await listUsers();
  const roles = await listRoles();
  return json({
    users,
    roles,
  });
}

export async function action({ request }: ActionArgs) {
  await mustBeAdmin(request); // TODO is this needed?
  const formData = await request.formData();
  const userId = formData.get("userId");
  if (userId === null || typeof userId !== "string") {
    throw json({ error: "Unknown user" }, { status: 400 });
  }
  const roles = await listRoles();
  for (const role of roles) {
    const roleState = formData.get(role);
    if (roleState !== null) {
      if (roleState === "true") {
        await assignRole(userId, role);
      } else {
        await unassignRole(userId, role);
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
    </main>
  );
}
