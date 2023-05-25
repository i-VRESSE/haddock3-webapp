import { type ActionArgs, json, redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { localLogin } from "~/models/user.server";
import { commitSession, setSession } from "~/session.server";
import { url } from "~/utils";

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

  const access_token = await localLogin(username, password);
  const session = await setSession(access_token, request);

  return redirect(url("/"), {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function LoginPage() {
  // Shared style between login and register. Extract if we use it more often?
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
        <h2 className={headerStyle}>Log in with username and password</h2>
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
        <button type="submit" className={buttonStyle}>
          Log in
        </button>
        <p>
          New user?{" "}
          <Link to={url("/register")} className={linkStyle}>
            Click here to register.
          </Link>
        </p>
      </Form>

      {/* Social buttons */}
      <h2 className="text-lg font-semibold">Other login methods</h2>
      <div className="space-evenly flex gap-4">
        <form method="post" action={url("/auth/github/authorize")}>
          <button type="submit" className="btn h-auto">
            <img
              height="32"
              width="32"
              src="github-fill.svg"
              alt="GitHub logo"
            />
            <p className="px-2">GitHub</p>
          </button>
        </form>
        <form method="post" action={url("/auth/orcidsandbox/authorize")}>
          <button type="submit" className="btn h-auto">
            <img height="32" width="32" src="orcid.png" alt="ORCID logo" />
            <p className="px-2">ORCID sandbox</p>
          </button>
        </form>
        <form method="post" action={url("/auth/orcid/authorize")}>
          <button type="submit" className="btn h-auto">
            <img height="32" width="32" src="orcid.png" alt="ORCID logo" />
            <p className="px-2">ORCID</p>
          </button>
        </form>
      </div>
    </main>
  );
}
