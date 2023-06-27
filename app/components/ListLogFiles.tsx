export const ListLogFiles = ({ jobid }: { jobid: number }) => {
  return (
    <ul className="ml-4 list-inside list-disc">
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
