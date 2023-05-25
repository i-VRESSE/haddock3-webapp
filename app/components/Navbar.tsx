import { Link, NavLink } from "@remix-run/react";
import { useIsAuthenticated, useIsSuperUser } from "~/session";
import { url } from "~/utils";

const LoggedInButton = () => {
  const isSuperUser = useIsSuperUser();
  return (
    <div className="dropdown-end dropdown">
      <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img alt="gravatar" src="https://www.gravatar.com/avatar/HASH" />{" "}
          {/* TODO: Make hash from user email */}
        </div>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
      >
        <li>
          <Link to={url("/profile")}>Profile</Link>
        </li>
        {isSuperUser && (
          <li>
            <Link to={url("/admin")}>Admin</Link>
          </li>
        )}
        <li>
          <Link to={url("/logout")}>Logout</Link>
        </li>
      </ul>
    </div>
  );
};

const LoginButton = () => <Link to="/login">Login</Link>;

export const Navbar = () => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className="to-primary/100] navbar bg-gradient-to-r from-primary via-primary/90">
      <div>
        <NavLink to="/" className="btn btn-ghost text-xl normal-case">
          Haddock3
        </NavLink>
      </div>
      <div className="navbar-start flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <NavLink to={url("/builder")}>Build</NavLink>
          </li>
          <li>
            <NavLink to={url("/upload")}>Upload</NavLink>
          </li>
          <li>
            <NavLink to={url("/jobs")}>Manage</NavLink>
          </li>
          <li>
            <NavLink to={url("/about")}>About</NavLink>
          </li>
          <li>
            <NavLink to={url("/help")}>Help</NavLink>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        {isAuthenticated ? <LoggedInButton /> : <LoginButton />}
      </div>
    </div>
  );
};
