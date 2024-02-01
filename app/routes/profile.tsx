import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, Link, useSubmit } from "@remix-run/react";
import { mustBeAuthenticated } from "~/auth.server";
import { useUser } from "~/auth";
import {
  listExpertiseLevels,
  setPreferredExpertiseLevel,
} from "~/models/user.server";
import { enumType, object, safeParse } from "valibot";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAuthenticated(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await mustBeAuthenticated(request);
  const formData = await request.formData();
  const ActionSchema = object({
    preferredExpertiseLevel: enumType(listExpertiseLevels()),
  });
  const result = safeParse(ActionSchema, Object.fromEntries(formData));
  if (result.success) {
    await setPreferredExpertiseLevel(
      userId,
      result.output.preferredExpertiseLevel
    );
  } else {
    const errors = result.issues;
    return json({ errors }, { status: 400 });
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
                <li key={level}>
                  <label>
                    <input
                      title="Preferred"
                      type="radio"
                      className="radio"
                      name="preferredExpertiseLevel"
                      value={level}
                      defaultChecked={user.preferredExpertiseLevel === level}
                    />{" "}
                    {level}
                  </label>
                </li>
              ))}
            </ul>
          </Form>
        ) : (
          <span>
            None assigned. If you just registered wait for administrator to
            assign a level to you. If you still don&apos;t have a level please
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
