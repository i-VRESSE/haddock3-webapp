import { json, type LinksFunction, type LoaderArgs, type MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { getAccessToken } from "./cookies.server";
import { Navbar } from "~/components/Navbar";

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
    <html lang="en" data-theme="bonvinlab">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="h-screen flex flex-col">
          <header>
            <div className="h-64 flex flex-col bg-cover bg-[url('https://www.bonvinlab.org/images/pages/banner_home-mini.jpg')]">
              <div className="flex-grow" />
              <Navbar />
            </div>
          </header>
          <div className="grow m-6">
            <Outlet />
          </div>
          <footer className="bg-primary text-center p-1">
            <p className="text-sm">
              This work is co-funded by the Horizon 2020 projects EOSC-hub and EGI-ACE (grant numbers 777536 and 101017567), BioExcel (grant numbers 823830 and 675728)
              and by a computing grant from NWO-ENW (project number 2019.053).
            </p>
            <p className="text-sm">
              2008-2023 © Computational Structural Biology group. All rights reserved.
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
