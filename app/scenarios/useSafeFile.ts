import { useEffect, useState } from "react";
import { jsonSafeFile } from "./restraints";

export function useSafeFile(raw: File) {
  // gzipping and base64 encoding file can be slow, so we cache it
  // for example 8qg1 of 1.7Mb took 208ms
  const [safeFile, setSafeFile] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchSafeFile = async () => {
      const result = await jsonSafeFile(raw);
      setSafeFile(result);
    };
    fetchSafeFile();
  }, [raw]);

  return safeFile;
}
