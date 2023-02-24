import { Link, NavLink } from "@remix-run/react";
import { useIsAuthenticated } from "~/cookies";

const LoggedInButton = () => {
    return (
        <div className="navbar-end">
            <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                        <img src="https://www.gravatar.com/avatar/HASH" />  {/* TODO: Make hash from user email */}
                    </div>
                </label>
                <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                        <Link to="/profile">
                            Profile
                        </Link>
                    </li>
                    <li><Link to="/logout">Logout</Link></li>
                </ul>
            </div>
        </div>
    )
}

const LoginButton = () => (
    <Link to="/login" className="navbar-end">Login</Link>
)

export const Navbar = () => {
    const isAuthenticated = useIsAuthenticated();

    return (
        <div className="navbar bg-gradient-to-r from-primary via-primary/90 to-primary/100]">
            <div>
                <NavLink to="/" className="btn btn-ghost normal-case text-xl">Haddock3</NavLink>
            </div>
            <div className="navbar-start flex">
                <ul className="menu menu-horizontal px-1">
                    <li tabIndex={0}>
                        <a>
                            Submit experiment
                            <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>
                        </a>
                        <ul className="p-2 bg-base-100 opacity-100">
                            <li><NavLink to="/applications/haddock3">Builder</NavLink></li>
                            <li><a>Upload</a></li>
                        </ul>
                    </li>
                    <li><NavLink to="/jobs">Inspect results</NavLink></li>
                    <li><NavLink to="/about">About</NavLink></li>
                    <li><NavLink to="/help">Help</NavLink></li>
                </ul>
            </div>
            {isAuthenticated ? <LoggedInButton /> : <LoginButton />}
        </div>
    )
}
