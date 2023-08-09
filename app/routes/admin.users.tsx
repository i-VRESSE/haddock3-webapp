import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { UserTableRow } from "~/components/admin/UserTableRow";
import {
  assignExpertiseLevel,
  listExpertiseLevels,
  listUsers,
  setIsAdmin,
  unassignExpertiseLevel,
} from "~/models/user.server";
import { mustBeAdmin } from "~/auth.server";

export async function loader({ request }: LoaderArgs) {
  await mustBeAdmin(request);
  const users = await listUsers();
  const expertiseLevels = listExpertiseLevels();
  return json({
    users,
    expertiseLevels,
  });
}

export async function action({ request }: ActionArgs) {
  await mustBeAdmin(request);
  const formData = await request.formData();
  const userId = formData.get("userId");
  if (userId === null || typeof userId !== "string") {
    throw json({ error: "Unknown user" }, { status: 400 });
  }
  const isAdmin = formData.get("isAdmin");
  if (isAdmin !== null) {
    await setIsAdmin(userId, isAdmin === "true");
  }
  const levels = listExpertiseLevels();
  for (const level of levels) {
    const levelState = formData.get(level);
    if (levelState !== null) {
      if (levelState === "true") {
        await assignExpertiseLevel(userId, level);
      } else {
        await unassignExpertiseLevel(userId, level);
      }
    }
  }
  return json({ error: null, ok: true });
}

export default function AdminUsersPage() {
  const { users, expertiseLevels } = useLoaderData<typeof loader>();
  const { submit, state } = useFetcher();
  return (
    <main>
      <h1 className="my-6 text-3xl">User admin</h1>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Batch</th>
            <th>Email</th>
            <th>Administrator?</th>
            <th>Expertise levels</th>
            <th>Actions</th>
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
                expertiseLevels={expertiseLevels}
              />
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
