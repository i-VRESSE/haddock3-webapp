import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  assignExpertiseLevel,
  listExpertiseLevels,
  listUsers,
  setIsAdmin,
  unassignExpertiseLevel,
} from "~/models/user.server";
import { mustBeAdmin } from "~/auth.server";
import { UserTableRow } from "~/admin/UserTableRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export async function loader({ request }: LoaderFunctionArgs) {
  await mustBeAdmin(request);
  const users = await listUsers();
  const expertiseLevels = listExpertiseLevels();
  return json({
    users,
    expertiseLevels,
  });
}

export async function action({ request }: ActionFunctionArgs) {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Administrator?</TableHead>
            <TableHead>Expertise levels</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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
        </TableBody>
      </Table>
    </main>
  );
}
