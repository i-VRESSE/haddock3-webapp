import { Link } from "@remix-run/react";

export function ToolHistory({
  interactivness,
  maxInteractivness,
}: {
  interactivness: number;
  maxInteractivness: number;
}) {
  return (
    <div className="block">
      <Link to="?i=0" className={interactivness === 0 ? "font-bold" : ""}>
        Original
      </Link>
      {maxInteractivness > 0 && (
        <>
          {" "}
          <Link to="?i=1" className={interactivness === 1 ? "font-bold" : ""}>
            Re-computed
          </Link>
        </>
      )}
    </div>
  );
}
