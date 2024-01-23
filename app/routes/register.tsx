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
import { Prisma } from "@prisma/client";
import { authenticator } from "~/auth.server";
import { register } from "~/models/user.server";
import { commitSession, getSession } from "~/session.server";
import { ErrorMessages } from "../components/ErrorMessages";

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
      "The passwords do not match."
    ),
  ]
);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = safeParse(RegisterSchema, Object.fromEntries(formData));
  if (!result.success) {
    const errors = flatten(result.error);
    return json({ errors }, { status: 400 });
  }
  const { username, password } = result.data;

  try {
    const user = await register(username, password);
    // Login the just registered user
    const session = await getSession(request.headers.get("cookie"));
    session.set(authenticator.sessionKey, user.id);
    const headers = new Headers({ "Set-Cookie": await commitSession(session) });
    return redirect("/", { headers });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const uniqueConstraintErrorCode = "P2002";
      if (error.code === uniqueConstraintErrorCode) {
        const errors: FlatErrors = {
          nested: { username: ["This email is already registered."] },
        };
        return json({ errors }, { status: 400 });
      }
      throw error;
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
  const inputStyle = "border-2 rounded p-1 w-full";
  const buttonStyle = "btn btn-sm btn-primary";
  const linkStyle = "link link-primary link-hover";
  const headerStyle = "text-lg text-center font-semibold";

  return (
    <main className={centeredColumn}>
      <Form method="post" className={formStyle}>
        <h2 className={headerStyle}>Register</h2>
        <div>
          <label>
            <p>Email</p>
            <input
              id="username"
              name="username"
              type="email"
              autoComplete="username"
              required
              className={inputStyle}
            />
          </label>
          <ErrorMessages path="username" errors={actionData?.errors} />
        </div>
        <div>
          <label>
            <p>Password</p>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              className={inputStyle}
            />
          </label>
          <ErrorMessages path="password" errors={actionData?.errors} />
        </div>

        <div>
          <label>
            <p>Confirm password</p>
            <input
              id="password2"
              name="password2"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              className={inputStyle}
            />
          </label>
          <ErrorMessages path="password2" errors={actionData?.errors} />
        </div>
        <ErrorMessages path="root" errors={actionData?.errors} />
        <button type="submit" className={buttonStyle}>
          Register
        </button>
        <p>
          Or{" "}
          <Link to="/login" className={linkStyle}>
            login
          </Link>{" "}
          if you already have an account.
        </p>
      </Form>
    </main>
  );
}
