import { PropsWithChildren } from "react";

export function FormDescription({ children }: PropsWithChildren): JSX.Element {
  return <p className="text-[0.8rem] text-muted-foreground">{children}</p>;
}
