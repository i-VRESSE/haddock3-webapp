import type { DirectoryItem } from "~/bartender-client";

const ListItem = ({ jobid, item }: { jobid: number; item: DirectoryItem }) => {
  if (item.isDir) {
    return <ListDir jobid={jobid} dir={item} />;
  } else {
    return <ListFile jobid={jobid} file={item} />;
  }
};

const ListFile = ({ jobid, file }: { jobid: number; file: DirectoryItem }) => (
  <li className="ml-2">
    {/* TODO pdb files could be displayed in a viewer like ngl */}
    <a
      target="_blank"
      rel="noreferrer"
      href={`/jobs/${jobid}/files/${file.path}`}
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

export const ListFiles = ({
  jobid,
  files,
}: {
  jobid: number;
  files: DirectoryItem;
}) => {
  return (
    <ul className="list-inside list-disc">
      {files.children &&
        files.children.map((f) => (
          <ListItem key={f.path} jobid={jobid} item={f} />
        ))}
    </ul>
  );
};
