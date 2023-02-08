import { Link } from "@remix-run/react";
import { useIsAuthenticated } from "~/cookies";

export default function Index() {
  const isAuthenticated = useIsAuthenticated();
  return (
    <main>
      <ul>
        <li>
          <Link to="/applications">Applications</Link>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/jobs">Jobs</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/logout">Logout</Link>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </main>
  );
}
