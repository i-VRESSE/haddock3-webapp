import { Link } from "@remix-run/react";

export function ToolHistory({
  interactivness,
  maxInteractivness,
}: {
  interactivness: number;
  maxInteractivness: number;
}) {
  const interactivnessLinks = [];
  if (maxInteractivness) {
    interactivnessLinks.push(
      interactivness === 0 ? (
        <b key="orig">O, </b>
      ) : (
        <span key="orig">
          <Link title="Original weights" to="?i=0">
            O
          </Link>
          ,{" "}
        </span>
      )
    );
  }
  // haddock3-int_rescore only creates 3 interactive dirs
  // for example 15_caprieval_interactive_interactive_interactive
  // subsequent rescores are written to same dir which
  // should not happen as job dir should be write once.
  // TODO make write once or encapsulate rescore in a new way
  for (let index = 1; index <= maxInteractivness; index++) {
    interactivnessLinks.push(
      interactivness === index ? (
        <b key={index}>
          {index}
          {index < maxInteractivness && ", "}
        </b>
      ) : (
        <span key={index}>
          <Link to={index === maxInteractivness ? "?" : `?i=${index}`}>
            {index}
          </Link>
          {index < maxInteractivness && ", "}
        </span>
      )
    );
  }
  return <div className="block">History: {interactivnessLinks}</div>;
}
