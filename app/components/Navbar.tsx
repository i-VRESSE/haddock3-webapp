import { Link, NavLink } from "@remix-run/react";
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

const LoggedInButton = () => {
  const user = useUser();
  const isAdmin = useIsAdmin();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* TODO button is not vertically centered */}
        <Button variant="outline" size="icon" className="rounded-full">
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

const LoginButton = () => (
  <Link className={navigationMenuTriggerStyle()} to="/login">
    Login
  </Link>
);

export const Navbar = () => {
  const loggedIn = useIsLoggedIn();

  return (
    <div className="flex w-full items-center bg-primary p-2 text-primary-foreground">
      <div className={navigationMenuTriggerStyle()}>
        <NavLink to="/" className="text-2xl ">
          Haddock3
        </NavLink>
      </div>
      <NavigationMenu className="">
        <NavigationMenuList className="flex space-x-5">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <NavLink to="/builder" className={navigationMenuTriggerStyle()}>
                Build
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <NavLink to="/upload" className={navigationMenuTriggerStyle()}>
                Upload
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <NavLink to="/jobs" className={navigationMenuTriggerStyle()}>
                Manage
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <NavLink to="/about" className={navigationMenuTriggerStyle()}>
                About
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <NavLink to="/help" className={navigationMenuTriggerStyle()}>
                Help
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="ml-auto">
        {loggedIn ? <LoggedInButton /> : <LoginButton />}
      </div>
    </div>
  );
};
