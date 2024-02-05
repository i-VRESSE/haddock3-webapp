import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  redirect,
  json,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { type FlatErrors, ValiError, flatten } from "valibot";
import { availableSocialLogins } from "~/auth";
import { AuthorizationError } from "remix-auth";
import { authenticator, getOptionalUser } from "~/auth.server";
import { ErrorMessages } from "~/components/ErrorMessages";
import { UserNotFoundError, WrongPasswordError } from "~/models/user.server";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getOptionalUser(request);
  if (user) {
    return redirect("/");
  }
  const socials = availableSocialLogins();
  return json({ socials });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    return await authenticator.authenticate("user-pass", request, {
      successRedirect: "/",
    });
  } catch (error) {
    if (error instanceof AuthorizationError && error.cause) {
      let errors: FlatErrors;
      if (error.cause instanceof WrongPasswordError) {
        errors = {
          nested: { password: [error.message] },
        };
      } else if (error.cause instanceof UserNotFoundError) {
        errors = {
          nested: { email: [error.message] },
        };
      } else if (error.cause instanceof ValiError) {
        errors = flatten(error.cause);
      } else {
        throw error;
      }
      return json({ errors }, { status: 400 });
    }

    throw error;
  }
}

export default function LoginPage() {
  const actionData = useActionData<{ errors: FlatErrors } | undefined>();
  const { socials } = useLoaderData<typeof loader>();
  // Shared style between login and register. Extract if we use it more often?
  const centeredColumn = "flex flex-col items-center gap-4";
  const formStyle =
    "flex flex-col items-stretch gap-4 border-2 rounded shadow-lg p-4";
  const headerStyle = "text-lg text-center font-semibold";

  return (
    <main className={centeredColumn}>
      <Form method="post" className={formStyle}>
        <h2 className={headerStyle}>Log in</h2>
        <div>
          <Label htmlFor="email">
            Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          <ErrorMessages path="email" errors={actionData?.errors} />
        </div>
        <div>
          <Label htmlFor="password">
            Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          <ErrorMessages path="password" errors={actionData?.errors} />
        </div>
        <Button type="submit">
          Log in
        </Button>
        <p>
        <Button asChild variant={"link"}>
          <Link to="/register">
          New user? Click here to register.
          </Link>
          </Button>
        </p>
      </Form>

      {/* Social buttons */}
      <h2 className="text-lg font-semibold">Other login methods</h2>
      <div className="space-evenly flex gap-4">
        {socials.includes("github") && (
          <form method="post" action="/auth/github/authorize">
            <Button type="submit" className="h-12" variant="secondary">
              <img
                height="32"
                width="32"
                src="github-fill.svg"
                alt="GitHub logo"
              />
              <p className="px-2">GitHub</p>
            </Button>
          </form>
        )}
        {socials.includes("orcid") && (
          <form method="post" action="/auth/orcid/authorize">
            <Button type="submit" className="h-12" variant="secondary">
              <img height="32" width="32" src="orcid.png" alt="ORCID logo" />
              <p className="px-2">ORCID</p>
            </Button>
          </form>
        )}
        {socials.includes("egi") && (
          <form method="post" action="/auth/egi/authorize">
            <Button type="submit" className="h-12" variant="secondary">
              <img
                height="32"
                width="32"
                src="egi.svg"
                alt="EGI Check-in logo"
              />
              <p className="px-2">EGI Check-in</p>
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
