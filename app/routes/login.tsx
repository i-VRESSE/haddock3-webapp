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
    <main className="flex flex-col items-center gap-4">

      <Form method="post" className="flex flex-col gap-4 border-2 rounded shadow-lg p-4">
        <h2 className="text-lg font-semibold">Log in with username and password</h2>
        <label>
          <p className="">Email</p>
          <input
            id="username"
            name="username"
            type="email"
            autoComplete="email"
            className="border-2 rounded p-1 w-full"
          />
        </label>
        <label>
          <p className="">Password</p>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="border-2 rounded p-1 w-full"
          />
        </label>
        <button type="submit" className="btn btn-sm btn-primary">Log in</button>
        <p>
          New user? <Link to="/register" className="link link-primary link-hover">Click here to register.</Link>
        </p>
      </Form>
      <h2 className="text-lg font-semibold">Other login methods</h2>
      <div className="flex space-evenly gap-4">
        <form method="post" action="/auth/github/authorize">
          <button type="submit" className="btn h-auto">
            <img height="32" width="32" src="github-fill.svg" alt="GitHub logo"/>
            <p className="px-2">GitHub</p>
          </button>
        </form>
        <form method="post" action="/auth/orcidsandbox/authorize">
          <button type="submit" className="btn h-auto">
            <img height="32" width="32" src="orcid.png" alt="ORCID logo"/>
            <p className="px-2">ORCID sandbox</p>
          </button>
        </form>
        <form method="post" action="/auth/orcid/authorize">
          <button type="submit" className="btn h-auto">
            <img height="32" width="32" src="orcid.png" alt="ORCID logo"/>
            <p className="px-2">ORCID</p>
          </button>
        </form >
      </div >
    </main >
  );
}
