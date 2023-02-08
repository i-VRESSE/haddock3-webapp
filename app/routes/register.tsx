import { type ActionArgs, json, type LoaderArgs, redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { userPrefs } from "~/cookies";
import { localLogin, register } from "~/models/user.server";

export async function loader({ request}: LoaderArgs) {
    // TODO check already logged in
    return json({});
}

export async function action({request}: ActionArgs) {
    const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return json(
        { errors: { email: "Email is required", password: "Password is required" } },
        { status: 400 }
      );
  }

  await register(email, password)

  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};
  const access_token = await localLogin(email, password)
  cookie.access_token = access_token
  return redirect("/", {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
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
        <button type="submit">Log in</button>
      </Form>
      <p>Or <Link to="/login">login</Link> if you already have an account.</p>
    </main>
  );
}
