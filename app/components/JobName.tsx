import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type { FlatErrors } from "valibot";

import { Schema, action } from "~/routes/jobs.$id.name";
import { ErrorMessages } from "./ErrorMessages";

export function JobName({ jobid, name }: { jobid: number; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { Form, data } = useFetcher<typeof action>();
  const fetcherData = data as
    | {
        name?: string;
        errors?: FlatErrors<typeof Schema>;
      }
    | undefined;

  useEffect(() => {
    if (fetcherData !== undefined && fetcherData.name !== undefined) {
      setIsEditing(false);
    }
  }, [fetcherData]);

  if (isEditing) {
    return (
      <Form method="post" action={`/jobs/${jobid}/name`} className="inline">
        <input
          type="text"
          name="name"
          defaultValue={name}
          className="mx-1 rounded border-2 bg-background p-1"
          maxLength={200}
          minLength={1}
          ref={inputRef}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsEditing(false);
            }
          }}
        />
        <ErrorMessages path="name" errors={fetcherData?.errors} />
        <button title="Save" type="submit">
          🖉
        </button>
      </Form>
    );
  }
  return (
    <button
      className="group/name"
      title="Click to change name"
      onClick={() => {
        setIsEditing(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }}
    >
      {name}
      <span className="invisible ps-1 group-hover/name:visible">🖉</span>
    </button>
  );
}
