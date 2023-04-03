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
  // Shared style between login and register. Extract if we use it more often
  const centeredColumn = "flex flex-col items-center gap-4";
  const formStyle = "flex flex-col items-stretch gap-4 border-2 rounded shadow-lg p-4";
  const inputStyle = "border-2 rounded p-1 w-full";
  const buttonStyle = "btn btn-sm btn-primary";
  const linkStyle = "link link-primary link-hover";
  const headerStyle = "text-lg text-center font-semibold";

  return (
    <main className={centeredColumn}>
      <Form method="post" className={formStyle}>
        <h2 className={headerStyle}>Register</h2>
        <label>
          <p>Email</p>
          <input
            id="username"
            name="username"
            type="email"
            autoComplete="email"
            className={inputStyle}
          />
        </label>
        <label>
          <p>Password</p>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={inputStyle}
          />
        </label>
        <button type="submit" className={buttonStyle}>Register</button>
        <p>
          Or <Link to="/login" className={linkStyle}>login</Link> if you already have an account.
        </p>
      </Form>
    </main>
  );
}
