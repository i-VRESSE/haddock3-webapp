import { json, type LinksFunction, type LoaderArgs, type MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Navbar } from "./components/Navbar";
import { getAccessToken } from "./cookies.server";

import styles from "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Haddock3",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  return json({
    access_token: await getAccessToken(request),
  });
}

export default function App() {
  return (
    <html lang="en" data-theme="cupcake">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="h-screen flex flex-col">
          <header>
            <div className="bg-primary p-10 text-center text-3xl">Bonvinlab image banner</div>
            <Navbar />
          </header>
          <div className="grow m-10">
            <Outlet />
          </div>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
          <footer className="bg-primary text-center p-1">Proudly sponsored by BonVinLab funders</footer>
        </div>
      </body>
    </html>
  );
}
