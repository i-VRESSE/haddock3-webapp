import { MenuList } from "./Navbar";
import { Banner } from "./Banner";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { Link, NavLink, useLocation } from "@remix-run/react";
import { useIsAdmin, useIsLoggedIn, useUser } from "~/auth";
import { generatePhoto } from "~/models/generatePhoto";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { prefix } from "~/prefix";

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

function PortalWarning() {
  return (
    <div className="m-2 p-3 bg-yellow-400 border-l-4 border-yellow-600 text-black font-bold rounded-md shadow-md">
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span>Development Preview - Features may be unstable</span>
      </div>
    </div>
  );
}

// Modeled after https://wenmr.science.uu.nl/new/prodigy
export function Portalheader() {
  return (
    <header>
      <PortalNavbar />
      <Haddock3Navbar />
      <PortalWarning />
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
      <DropdownMenu>
        <DropdownMenuTrigger className="bg-secondary" asChild>
          <Button variant="ghost">Services</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {SERVICES.map((service) => (
            <DropdownMenuItem asChild key={service.url}>
              <a
                href={service.url}
                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                {service.name}
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </NavigationMenuItem>
  );
}

function AnonymousUserButton() {
  const { pathname } = useLocation();
  const photo = useMemo(() => generatePhoto("anonymous@bonvinlab.org"), []);

  return (
    <NavigationMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="bg-secondary flex flex-row items-center"
          asChild
        >
          <Button variant="ghost">
            Anonymous&nbsp;
            <img
              alt="gravatar"
              src={photo}
              className="h-10 w-10 dark:invert rounded-full"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a
              href={`/new/login?redirect_uri=${prefix}${pathname.slice(1)}`}
              className="block hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Login
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={`/new/registration?redirect_uri=${prefix}${pathname.slice(1)}`}
              className="block hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Register
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </NavigationMenuItem>
  );
}

function LoggedInButton() {
  const user = useUser();
  const userName = user.email.split("@")[0];
  const isAdmin = useIsAdmin();

  return (
    <NavigationMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger className="bg-secondary" asChild>
          <Button variant="ghost">
            {userName}
            &nbsp;
            <img
              alt="gravatar"
              src={user.photo}
              className="h-10 w-10 dark:invert rounded-full"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a
              href="/new/dashboard"
              className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Dashboard
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/profile">Haddock3 settings</Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <a
                href="/new/admin"
                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                Admin
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to="/new/logout">Logout</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
