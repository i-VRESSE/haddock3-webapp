import { type ActionArgs, json, redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { userPrefs } from "~/cookies.server";
import { localLogin } from "~/models/user.server";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return json(
      {
        errors: {
          username: "Email is required",
          password: "Password is required",
        },
      },
      { status: 400 }
    );
  }

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  const access_token = await localLogin(username, password);
  cookie.access_token = access_token;
  return redirect("/", {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
}

export default function LoginPage() {
  return (
    <main className="prose container">

      <h2>Log in with username and password</h2>
      <Form method="post" className="flex flex-col gap-2">
        <div className="form-control">
          <label className="input-group">
            <span>Email</span>
            <input
              id="username"
              name="username"
              type="email"
              autoComplete="email"
              className="px-2"
            />
          </label>
        </div>
        <label className="input-group">
          <span>Password</span>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="px-2"
          />
        </label>
        <button type="submit" className="btn w-24">Log in</button>
      </Form>

      <h2>New user?</h2>
      <button className="btn w-24">Register</button>

      <h2>Other login methods</h2>
      <div className="flex space-evenly gap-4">
        <form method="post" action="/auth/github/authorize">
          <button type="submit" className="btn gap-2 h-auto">
            <img height="32" width="32" src="github-fill.svg" />
            GitHub
          </button>
        </form>
        <form method="post" action="/auth/orcidsandbox/authorize">
          <button type="submit" className="btn gap-2 h-auto">
            <img height="32" width="32" src="orcid.svg" />
            ORCID sandbox
          </button>
        </form>
        <form method="post" action="/auth/orcid/authorize">
          <button type="submit" className="btn gap-2 h-auto">
            <img height="32" width="32" src="orcid.svg" />
            ORCID
          </button>
        </form>
      </div>
    </main>
  );
}
