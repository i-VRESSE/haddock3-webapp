import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { userPrefs } from "~/cookies.server";
import { localLogin, register } from "~/models/user.server";

export async function loader({ request }: LoaderArgs) {
  // TODO check already logged in
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return json(
      {
        errors: {
          email: "Email is required",
          password: "Password is required",
        },
      },
      { status: 400 }
    );
  }
  await register(username, password);

  const access_token = await localLogin(username, password);
  return redirect("/", {
    headers: {
      "Set-Cookie": await userPrefs.serialize({ access_token }),
    },
  });
}

export default function RegisterPage() {
  return (
    <main>
      <Form method="post">
        <label>
          Username:
          <input
            id="username"
            name="username"
            type="email"
            autoComplete="email"
          />
        </label>
        <label>
          Password:
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </label>
        <button type="submit">Register</button>
      </Form>
      <p>
        Or <Link to="/login">login</Link> if you already have an account.
      </p>
    </main>
  );
}
