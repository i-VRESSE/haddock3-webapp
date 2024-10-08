import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, Link, useSubmit } from "@remix-run/react";
import { getUser } from "~/auth.server";
import { useUser } from "~/auth";
import {
  listExpertiseLevels,
  setPreferredExpertiseLevel,
} from "~/models/user.server";
import { object, picklist, safeParse } from "valibot";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useTheme, Theme } from "remix-themes";
import { useInPortalMode } from "~/portal";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await getUser(request);
  return json({});
};

const ActionSchema = object({
  preferredExpertiseLevel: picklist(listExpertiseLevels()),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUser(request);
  const formData = await request.formData();
  const result = safeParse(ActionSchema, Object.fromEntries(formData));

  if (result.success) {
    await setPreferredExpertiseLevel(
      user.id,
      result.output.preferredExpertiseLevel,
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
  const inPortalModel = useInPortalMode();
  const handleChangePreferredExpertiseLevel = (
    event: React.ChangeEvent<HTMLFormElement>,
  ) => {
    submit(event.currentTarget);
  };
  const [theme, setTheme] = useTheme();

  return (
    <main>
      <p>Email: {user.email}</p>
      <fieldset className="py-2">
        <legend>Expertise levels</legend>
        {user.expertiseLevels.length ? (
          <Form method="post" onChange={handleChangePreferredExpertiseLevel}>
            <RadioGroup
              defaultValue={user.preferredExpertiseLevel as string}
              name="preferredExpertiseLevel"
            >
              {user.expertiseLevels.map((level) => (
                <div className="flex items-center space-x-2" key={level}>
                  <RadioGroupItem value={level} id={level} />
                  <Label htmlFor={level}>{level}</Label>
                </div>
              ))}
            </RadioGroup>
          </Form>
        ) : (
          <span>
            None assigned. If you just registered wait for administrator to
            assign a level to you. If you still don&apos;t have a level please
            context administrator.
          </span>
        )}
      </fieldset>
      <fieldset className="py-2">
        <legend>Theme</legend>
        <RadioGroup
          defaultValue={theme || ""}
          name="theme"
          onValueChange={(t) => {
            setTheme(t === "" ? null : (t as Theme));
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={Theme.LIGHT} id={Theme.LIGHT} />
            <Label htmlFor={Theme.LIGHT}>Light</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={Theme.DARK} id={Theme.DARK} />
            <Label htmlFor={Theme.DARK}>Dark</Label>
          </div>
        </RadioGroup>
      </fieldset>

      {!inPortalModel && (
        <>
          {/* TODO add change password form if user is not authenticated with a social login */}
          <Button asChild variant="outline">
            <Link to="/logout">Logout</Link>
          </Button>
        </>
      )}
    </main>
  );
}
