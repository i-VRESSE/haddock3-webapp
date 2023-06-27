export const ListLogFiles = ({ jobid }: { jobid: number }) => {
  return (

      <ul className="list-inside list-disc ml-4">
        <li>
          <a target="_blank" rel="noreferrer" href={`/jobs/${jobid}/stdout`}>
            Stdout
          </a>
        </li>
        <li>
          <a target="_blank" rel="noreferrer" href={`/jobs/${jobid}/stderr`}>
            Stderr
          </a>
        </li>
        <li>
          <a
            target="_blank"
            rel="noreferrer"
            href={`/jobs/${jobid}/files/output/log`}
          >
            Haddock3 log
          </a>
        </li>
      </ul>
  );
};
