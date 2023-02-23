import { Link } from "@remix-run/react";
import { useIsAuthenticated } from "~/cookies";

export default function Index() {
  const isAuthenticated = useIsAuthenticated();
  return (
    <main>
      <h1 className="text-2xl font-bold underline">
    Hello world!
  </h1>
      <ul>
        Haddock3
        <li>
          <ul>
            <li>
              <Link to={`/applications/haddock3`}>
                 with workflow builder
              </Link>
            </li>
            <li>Upload archive</li>
          </ul>
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
