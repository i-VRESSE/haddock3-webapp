import type { DirectoryItem } from "~/bartender-client";

const ListItem = ({ jobid, item }: { jobid: number; item: DirectoryItem }) => {
    if (item.children) {
        return <ListDir jobid={jobid} dir={item} />;
    } else {
        return <ListFile jobid={jobid} file={item} />;
    }
}


const ListFile = ({ jobid, file }: { jobid: number; file: DirectoryItem }) => (
  <li className="ml-2">
    <a
      target="_blank"
      rel="noreferrer"
      title="Archive of step"
      href={`/jobs/${jobid}/archive/${file.path}`}
    >
      {file.name}
    </a>
  </li>
);

const ListDir = ({ jobid, dir }: { jobid: number; dir: DirectoryItem }) => (
  <details className="ml-2">
    <summary>{dir.name}/</summary>
    <ul className="list-inside list-disc">
    {dir.children &&
      dir.children.map((f) => {
        return <ListItem key={f.path} jobid={jobid} item={f} />;
      })}
      </ul>
  </details>
);

export const ListInputFiles = ({
  jobid,
  files,
}: {
  jobid: number;
  files: DirectoryItem;
}) => {
  return (
    <ul className="list-inside list-disc">
      {files.children &&
        files.children.map((f) => <ListItem key={f.path} jobid={jobid} item={f} />)}
    </ul>
  );
};
