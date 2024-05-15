import { MenuList } from "./Navbar";
import { Banner } from "./Banner";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { Link, NavLink } from "@remix-run/react";
import { useIsAdmin, useIsLoggedIn, useUser } from "~/auth";
import { generatePhoto } from "~/models/generatePhoto";
import { useMemo } from "react";

function Haddock3Navbar() {
  return (
    <div className="mx-auto w-full flex justify-center bg-primary text-primary-foreground items-center">
      <div className={navigationMenuTriggerStyle()}>
        <NavLink to="/">HADDOCK3</NavLink>
      </div>
      <MenuList />
    </div>
  );
}

// Modeled after https://wenmr.science.uu.nl/new/prodigy
export function Portalheader() {
  return (
    <header>
      <PortalNavbar />
      <Haddock3Navbar />
      <Banner />
    </header>
  );
}

const mainPages = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Tutorials",
    link: "https://www.bonvinlab.org/education/#tutorials",
  },
  {
    name: "Help",
    link: "https://ask.bioexcel.eu/",
  },
  {
    name: "Stats",
    link: "/stats",
  },
  {
    name: "Wiki",
    link: "/wiki",
  },
] as const;

export const SERVICES = [
  {
    name: "HADDOCK v2.4",
    url: "https://bianca.science.uu.nl/haddock2.4/",
  },

  {
    name: "HADDOCK v3.0",
    url: "/haddock30",
  },
];

function ServicesMenu() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="bg-secondary">
        Services
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="flex flex-col gap-2 p-4 whitespace-nowrap">
          {SERVICES.map((service) => (
            <li key={service.name}>
              <NavigationMenuLink asChild>
                <a
                  href={service.url}
                  className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {service.name}
                </a>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function AnonymousUserButton() {
  const photo = useMemo(() => generatePhoto("anonymous@bonvinlab.org"), []);

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="bg-secondary">
        Anonymous&nbsp;
        <img alt="gravatar" src={photo} className="h-10 w-10 dark:invert" />
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="flex flex-col gap-3 p-4">
          <li>
            <NavigationMenuLink asChild>
              <a
                href="/login"
                className="block hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                Login
              </a>
            </NavigationMenuLink>
          </li>
          <li>
            <NavigationMenuLink asChild>
              <a
                href="/registration"
                className="block hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                Register
              </a>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function LoggedInButton() {
  const user = useUser();
  const userName = user.email.split("@")[0];
  const isAdmin = useIsAdmin();

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="bg-secondary">
        {userName}
        &nbsp;
        <img
          alt="gravatar"
          src={user.photo}
          className="h-10 w-10 dark:invert"
        />
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="flex flex-col gap-2 p-4">
          <li>
            <NavigationMenuLink asChild>
              <a
                href="/dashboard"
                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                Dashboard
              </a>
            </NavigationMenuLink>
          </li>
          <li>
            <NavigationMenuLink asChild>
              <Link to="/profile">Haddock3 settings</Link>
            </NavigationMenuLink>
          </li>
          {isAdmin && (
            <li>
              <NavigationMenuLink asChild>
                <a
                  href="/admin"
                  className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  Admin
                </a>
              </NavigationMenuLink>
            </li>
          )}
          <li>
            <NavigationMenuLink asChild>
              <Link to="/logout">Logout</Link>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function PortalNavbar() {
  const loggedIn = useIsLoggedIn();

  return (
    <div className="w-full flex justify-center bg-secondary text-secondary-foreground">
      <NavigationMenu>
        <NavigationMenuList>
          {mainPages.map((page) => (
            <NavigationMenuItem key={page.link}>
              <NavigationMenuLink asChild>
                <a
                  href={page.link}
                  className={navigationMenuTriggerStyle({
                    className: "bg-secondary",
                  })}
                >
                  {page.name}
                </a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
          <ServicesMenu />
          {loggedIn ? <LoggedInButton /> : <AnonymousUserButton />}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
