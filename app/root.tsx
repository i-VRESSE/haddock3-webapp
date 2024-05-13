import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { getOptionalClientUser } from "./auth.server";
import styles from "./tailwind.css?url";
import { Navbar } from "./components/Navbar";
import { Banner } from "./components/Banner";
import { themeSessionResolver } from "./session.server";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import clsx from "clsx";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const meta: MetaFunction = () => {
  return [{ title: "Haddock3" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const user = await getOptionalClientUser(request);
  return json({ user, theme: getTheme() });
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
          <header>
            <Banner />
            <Navbar />
          </header>
          <div className="m-6 grow">
            <Outlet />
          </div>
          <footer className="bg-primary p-1 text-center text-primary-foreground">
            <p className="text-sm">
              This work is co-funded by the Horizon 2020 projects EOSC-hub and
              EGI-ACE (grant numbers 777536 and 101017567), BioExcel (grant
              numbers 823830 and 675728) and by a computing grant from NWO-ENW
              (project number 2019.053).
            </p>
            <p className="text-sm">
              2008-2023 © Computational Structural Biology group. All rights
              reserved.
            </p>
          </footer>
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
          <header>
            <div className="flex h-64 flex-col bg-[url('https://www.bonvinlab.org/images/pages/banner_home-mini.jpg')] bg-cover">
              <div className="flex-grow" />{" "}
              {/* Push the navbar to the bottom of the banner */}
              <Navbar />
            </div>
          </header>
          <div className="bg-error-content grow p-6">{children}</div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
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
            <p>Page requires authorization. Please login and try again.</p>
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
