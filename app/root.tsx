import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react";

import { getOptionalClientUser } from "./auth.server";
import styles from "./tailwind.css?url";
import { themeSessionResolver } from "./session.server";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import clsx from "clsx";
import { inPortalMode } from "./portal.server";
import { useInPortalMode } from "./portal";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { prefix } from "./prefix";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const meta: MetaFunction = () => {
  return [{ title: "Haddock3" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const user = await getOptionalClientUser(request);
  return json({ user, theme: getTheme(), inPortalMode });
}

export function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  return (
    <html lang="en" className={clsx(theme ?? "")}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="m-6 grow">
            <Outlet />
          </div>
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  );
}

function BoundaryShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="bonvinlab">
      <head>
        <title>{`Haddock3 - ${title}`}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="bg-error-content grow p-6">{children}</div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const inPortalMode = useInPortalMode();
  const { pathname } = useLocation();
  console.error(error);

  // Logic copied from https://github.com/remix-run/remix/blob/main/packages/remix-react/errorBoundaries.tsx
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 401:
        return (
          <BoundaryShell title="Unauthorized">
            <h2 className="py-8 text-xl">
              {error.status} {error.data?.error && error.data.error}
            </h2>
            <p>Page requires authorization.</p>
            {inPortalMode ? (
              <p>
                Please{" "}
                <a
                  href={`/login?redirect_uri=${prefix}${pathname.slice(1)}`}
                  className="underline"
                >
                  login
                </a>{" "}
                or{" "}
                <a
                  href={`/registration?redirect_uri=${prefix}${pathname.slice(1)}`}
                  className="underline"
                >
                  register
                </a>{" "}
                to use the services of the BonvinLab.
              </p>
            ) : (
              <p>
                Please{" "}
                <Link
                  to={`/login?redirect_uri=${prefix}${pathname.slice(1)}`}
                  className="underline"
                >
                  login
                </Link>{" "}
                and try again.
              </p>
            )}
          </BoundaryShell>
        );
      case 403:
        return (
          <BoundaryShell title="Forbidden">
            <h2 className="py-8 text-xl">
              {error.status} {error.data?.error && error.data.error}
            </h2>
            <p>Page requires permissions you do not have.</p>
          </BoundaryShell>
        );
      case 404:
        return (
          <BoundaryShell title="Not Found">
            <h2 className="py-8 text-xl">Page not found</h2>
          </BoundaryShell>
        );
    }
    return (
      <BoundaryShell title="Routing error">
        <h1 className="py-8 text-2xl">Something bad happened</h1>
        <h2 style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
          {error.status} {error.data?.error && error.data.error}
        </h2>
        <p>{error.statusText}</p>
      </BoundaryShell>
    );
  }

  let errorInstance: Error;
  if (error instanceof Error) {
    errorInstance = error;
  } else {
    const errorString =
      error == null
        ? "Unknown Error"
        : typeof error === "object" && "toString" in error
          ? error.toString()
          : JSON.stringify(error);
    errorInstance = new Error(errorString);
  }

  return (
    <BoundaryShell title="Error!">
      <h1 className="py-8 text-2xl">Something bad happened</h1>
      <div>The website administrators have been notified.</div>
      {process.env.NODE_ENV !== "production" && (
        <details>
          <summary>Details</summary>
          <pre>{errorInstance.stack}</pre>
        </details>
      )}
    </BoundaryShell>
  );
}
