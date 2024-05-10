import { useState, useEffect, ReactNode } from "react";

export function LinkToFile({
  file,
  children,
}: {
  file: File;
  children: ReactNode;
}) {
  const [url, setUrl] = useState("#");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <a href={url} className="underline" download={file.name}>
      {children}
    </a>
  );
}
