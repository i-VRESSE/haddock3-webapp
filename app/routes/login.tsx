import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { availableSocialLogins } from "~/auth";
import { authenticator, getOptionalUser } from "~/auth.server";

export async function loader({ request }: LoaderArgs) {
  const user = await getOptionalUser(request);
  if (user) {
    return redirect("/");
  }
  const socials = availableSocialLogins();
  return json({ socials });
}

export async function action({ request }: ActionArgs) {
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
}

export default function LoginPage() {
  const { socials } = useLoaderData<typeof loader>();
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
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputStyle}
            required
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
            required
          />
        </label>
        <button type="submit" className={buttonStyle}>
          Log in
        </button>
        <p>
          New user?{" "}
          <Link to="/register" className={linkStyle}>
            Click here to register.
          </Link>
        </p>
      </Form>

      {/* Social buttons */}
      <h2 className="text-lg font-semibold">Other login methods</h2>
      <div className="space-evenly flex gap-4">
        {socials.includes("github") && (
          <form method="post" action="/auth/github/authorize">
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
        )}
        {socials.includes("orcid") && (
          <form method="post" action="/auth/orcid/authorize">
            <button type="submit" className="btn h-auto">
              <img height="32" width="32" src="orcid.png" alt="ORCID logo" />
              <p className="px-2">ORCID</p>
            </button>
          </form>
        )}
        {socials.includes("egi") && (
          <form method="post" action="/auth/egi/authorize">
            <button type="submit" className="btn h-auto">
              <img
                height="32"
                width="32"
                src="egi.svg"
                alt="EGI Check-in logo"
              />
              <p className="px-2">EGI Check-in</p>
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
