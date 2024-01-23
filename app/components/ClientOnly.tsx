// remix-utils gave import error on remix v1.15.0 so I copied the ClientOnly code from
// typecheck error:
// Error: node_modules/remix-utils/build/react/handle-conventions.d.ts(1,27): error TS2307: Cannot find module '@remix-run/react/dist/routeData' or its corresponding type declarations.
// Error: Process completed with exit code 2.

import { useState, useEffect, type ReactNode } from "react";

// https://github.com/sergiodxa/remix-utils/blob/main/src/react/use-hydrated.ts
let hydrating = true;

function useHydrated() {
  const [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}

type Props = {
  /**
   * You are encouraged to add a fallback that is the same dimensions
   * as the client rendered children. This will avoid content layout
   * shift which is disgusting
   */
  children(): ReactNode;
  fallback?: ReactNode;
};
export function ClientOnly({ children, fallback = null }: Props) {
  return useHydrated() ? <>{children()}</> : <>{fallback}</>;
}
