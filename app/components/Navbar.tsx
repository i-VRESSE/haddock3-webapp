import { Link, NavLink } from "@remix-run/react";
import { useIsAdmin, useIsLoggedIn, useUser } from "~/auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
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
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="w-10 rounded-full">
            <img alt="gravatar" src={user.photo} />{" "}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem>
            <Link to="/admin">Admin</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Link to="/logout">Logout</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LoginButton = () => <Link to="/login">Login</Link>;

export const Navbar = () => {
  const loggedIn = useIsLoggedIn();

  return (
    <div className="flex w-full bg-secondary text-secondary-foreground items-center justify-between">
      <div>
        <NavLink to="/" className="text-xl normal-case">
          Haddock3
        </NavLink>
      </div>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavLink to="/builder">Build</NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/upload">Upload</NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/jobs">Manage</NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/about">About</NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/help">
              <NavigationMenuLink>Help</NavigationMenuLink>
            </NavLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="navbar-end">
        {loggedIn ? <LoggedInButton /> : <LoginButton />}
      </div>
    </div>
  );
};
