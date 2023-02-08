import { type ActionArgs, json, redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { userPrefs } from "~/cookies";
import { localLogin } from "~/models/user.server";

export async function action({request}: ActionArgs) {
    const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return json(
        { errors: { username: "Email is required", password: "Password is required" } },
        { status: 400 }
      );
  }

  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};
  const access_token = await localLogin(username, password)
  cookie.access_token = access_token
  return redirect("/", {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
}

export default function LoginPage() {
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
      <p>Or <Link to="/register">register</Link></p>
    </main>
  );
}
