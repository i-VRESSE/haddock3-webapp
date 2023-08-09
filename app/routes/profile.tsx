import { type ActionArgs, json, type LoaderArgs } from "@remix-run/node";
import { Form, Link, useSubmit } from "@remix-run/react";
import { mustBeAuthenticated } from "~/auth.server";
import { useUser } from "~/auth";
import { setPreferredExpertiseLevel } from "~/models/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  await mustBeAuthenticated(request);
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await mustBeAuthenticated(request);
  const formData = await request.formData();
  const preferredExpertiseLevel = formData.get("preferredExpertiseLevel");
  if (
    preferredExpertiseLevel !== null &&
    typeof preferredExpertiseLevel === "string"
  ) {
    await setPreferredExpertiseLevel(userId, preferredExpertiseLevel);
  }
  return null;
};

export default function Page() {
  const user = useUser();
  const submit = useSubmit();
  const handleChangePreferredExpertiseLevel = (
    event: React.ChangeEvent<HTMLFormElement>
  ) => {
    submit(event.currentTarget);
  };
  return (
    <main>
      <p>Email: {user.email}</p>
      <fieldset>
        <legend>Expertise levels</legend>
        {user.expertiseLevels.length ? (
          <Form method="post" onChange={handleChangePreferredExpertiseLevel}>
            <ul className="list-inside">
              {user.expertiseLevels.map((level) => (
                <li key={level.name}>
                  <label>
                    <input
                      title="Preferred"
                      type="radio"
                      className="radio"
                      name="preferredExpertiseLevel"
                      value={level.name}
                      defaultChecked={
                        user.preferredExpertiseLevel === level.name
                      }
                    />{" "}
                    {level.name}
                  </label>
                </li>
              ))}
            </ul>
          </Form>
        ) : (
          <span>
            None assigned. If you just registered wait for administrator to
            assign a level to you. If you still don't have a level please
            context administrator.
          </span>
        )}
      </fieldset>

      {/* TODO add change password form if user is not authenticated with a social login */}
      <Link role="button" className="btn btn-sm m-2" to="/logout">
        Logout
      </Link>
    </main>
  );
}
