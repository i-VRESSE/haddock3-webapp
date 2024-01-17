import { Link } from "@remix-run/react";

export function ToolHistory({
  showInteractiveVersion,
  hasInteractiveVersion,
}: {
  showInteractiveVersion: boolean;
  hasInteractiveVersion: boolean;
}) {
  return (
    <div className="block">
      <Link to="?i=0" className={showInteractiveVersion ? "" : "font-bold"}>
        Original
      </Link>
      {hasInteractiveVersion && (
        <>
          {" "}
          <Link to="?i=1" className={showInteractiveVersion ? "font-bold" : ""}>
            Re-computed
          </Link>
        </>
      )}
    </div>
  );
}
