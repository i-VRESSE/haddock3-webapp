import { cssBundleHref } from "@remix-run/css-bundle";
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";

import { getOptionalClientUser } from "./auth.server";
import styles from "./tailwind.css";
import { Navbar } from "./components/Navbar";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: styles },
];

export const meta: MetaFunction = () => {
  return [{ title: "Haddock3" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getOptionalClientUser(request);
  return json({ user });
}

export default function App() {
  return (
    <html lang="en" data-theme="bonvinlab">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
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
          <div className="m-6 grow">
            <Outlet />
          </div>
          <footer className="bg-primary p-1 text-center">
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
        <LiveReload />
      </body>
    </html>
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
        <title>Haddock3 - {title}</title>
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
          <div className="grow bg-error-content p-6">
            <h1 className="py-8 text-2xl">Something bad happened.</h1>
            {children}
          </div>
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
    return (
      <BoundaryShell title="Unhandled Thrown Response!">
        <h1 style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
          {error.status} {error.statusText}
        </h1>
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
