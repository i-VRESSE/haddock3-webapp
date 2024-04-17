import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import {
  type FlatErrors,
  custom,
  email,
  flatten,
  minLength,
  object,
  safeParse,
  string,
} from "valibot";
import { authenticator } from "~/auth.server";
import { EmailAlreadyRegisteredError, register } from "~/models/user.server";
import { commitSession, getSession } from "~/session.server";
import { ErrorMessages } from "../components/ErrorMessages";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  return json({});
}

const RegisterSchema = object(
  {
    username: string([email()]),
    password: string([minLength(8)]),
    password2: string([minLength(8)]),
  },
  [
    custom(
      ({ password, password2 }) => password === password2,
      "The passwords do not match.",
    ),
  ],
);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = safeParse(RegisterSchema, Object.fromEntries(formData));
  if (!result.success) {
    const errors = flatten(result.issues);
    return json({ errors }, { status: 400 });
  }
  const { username, password } = result.output;

  try {
    const user = await register(username, password);
    // Login the just registered user
    const session = await getSession(request.headers.get("cookie"));
    session.set(authenticator.sessionKey, user.id);
    const headers = new Headers({ "Set-Cookie": await commitSession(session) });
    return redirect("/", { headers });
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) {
      const errors: FlatErrors = {
        nested: { username: ["This email is already registered."] },
      };
      return json({ errors }, { status: 400 });
    }
    throw error;
  }
}

export default function RegisterPage() {
  const actionData = useActionData<typeof action>();
  // Shared style between login and register. Extract if we use it more often
  const centeredColumn = "flex flex-col items-center gap-4";
  const formStyle =
    "flex flex-col items-stretch gap-4 border-2 rounded shadow-lg p-4";
  const headerStyle = "text-lg text-center font-semibold";

  return (
    <main className={centeredColumn}>
      <Form method="post" className={formStyle}>
        <h2 className={headerStyle}>Register</h2>
        <div>
          <Label htmlFor="username">Email</Label>
          <Input
            id="username"
            name="username"
            type="email"
            autoComplete="username"
            required
          />
          <ErrorMessages path="username" errors={actionData?.errors} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
          <ErrorMessages path="password" errors={actionData?.errors} />
        </div>

        <div>
          <Label htmlFor="password2">Confirm password</Label>
          <Input
            id="password2"
            name="password2"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
          <ErrorMessages path="password2" errors={actionData?.errors} />
        </div>
        <ErrorMessages path="root" errors={actionData?.errors} />
        <Button type="submit">Register</Button>
        <p>
          <Button asChild variant={"link"}>
            <Link to="/login">Or login if you already have an account.</Link>
          </Button>
        </p>
      </Form>
    </main>
  );
}
