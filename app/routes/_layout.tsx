import { LinksFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Navbar } from "~/components/Navbar";

import styles from ".././tailwind.css";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: styles },
];

export default function Layout() {
    return (
        <div className="h-screen flex flex-col">
            <header>
                <div className="bg-primary p-10 text-center text-3xl">Bonvinlab image banner</div>
                <Navbar />
            </header>
            <div className="grow m-6">
                <Outlet />
            </div>
            <footer className="bg-primary text-center p-1">Proudly sponsored by BonVinLab funders</footer>
        </div>
    )
}
