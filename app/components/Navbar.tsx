import { Link, NavLink, useLocation } from "@remix-run/react";
import { useIsAdmin, useIsLoggedIn, useUser } from "~/auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { prefix } from "~/prefix";

const LoggedInButton = () => {
  const user = useUser();
  const isAdmin = useIsAdmin();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full overflow-hidden"
        >
          <img alt="gravatar" src={user.photo} className="dark:invert" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin">Admin</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/logout">Logout</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LoginButton = () => {
  const { pathname } = useLocation();
  return (
    <Link
      className={navigationMenuTriggerStyle()}
      to={`/login?redirect_uri=${prefix}${pathname.slice(1)}`}
    >
      Login
    </Link>
  );
};

function MyNavLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild active={isActive}>
        <Link to={to} className={navigationMenuTriggerStyle()}>
          {children}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

export function MenuList() {
  return (
    <NavigationMenu className="">
      <NavigationMenuList className="flex space-x-5">
        <MyNavLink to="/scenarios">Scenario</MyNavLink>
        <MyNavLink to="/builder">Builder</MyNavLink>
        <MyNavLink to="/upload">Upload</MyNavLink>
        <MyNavLink to="/jobs">Manage</MyNavLink>
        <MyNavLink to="/about">About</MyNavLink>
        <MyNavLink to="/help">Help</MyNavLink>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export const Navbar = () => {
  const loggedIn = useIsLoggedIn();

  return (
    <div className="flex w-full items-center bg-primary p-2 text-primary-foreground">
      <div className={navigationMenuTriggerStyle()}>
        <NavLink to="/" className="text-2xl ">
          Haddock3
        </NavLink>
      </div>
      <MenuList />
      <div className="ml-auto">
        {loggedIn ? <LoggedInButton /> : <LoginButton />}
      </div>
    </div>
  );
};
