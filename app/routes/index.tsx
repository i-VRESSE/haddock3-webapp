import { Link } from "@remix-run/react";
import { useIsAuthenticated } from "~/cookies.client";

export default function Index() {
  const isAuthenticated = useIsAuthenticated()
  return (
    <main>
      <ul>
      <li><Link to="/applications">Applications</Link></li>
      {isAuthenticated ? 
        <li><Link to="/logout">Logout</Link></li>
        :
        <li><Link to="/login">Login</Link></li>
      }      
      </ul>
    </main>
  );
}
