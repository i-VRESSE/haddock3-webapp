import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { applicationNames } from "~/models/applicaton.server";

export const loader = async () => {
  const applications = await applicationNames();
  return json({
    applications,
  });
};

export default function Applications() {
  const { applications } = useLoaderData<typeof loader>();
  return (
    <main>
      <ol>
        {applications.map((a) => (
          <li key={a}>
            <a href={`/applications/${a}`}>{a}</a>
          </li>
        ))}
      </ol>
    </main>
  );
}
