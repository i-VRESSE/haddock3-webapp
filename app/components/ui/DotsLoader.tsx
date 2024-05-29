import { ComponentPropsWithoutRef, useEffect, useState } from "react";

type DotsProps = {
  state: string;
  label?: string;
  maxLength?: number;
} & ComponentPropsWithoutRef<"div">;

export default function DotsLoader({
  state,
  label = "Loading",
  maxLength = 30,
  ...props
}: DotsProps) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      // console.log("increase counter...")
      setCount((cnt) => {
        if (cnt > maxLength) {
          // make negative, then the dot count decreases
          return -maxLength;
        }
        return cnt + 1;
      });
    }, 1000);

    return () => {
      // clean up
      clearInterval(timer);
    };
  }, [maxLength]);

  useEffect(() => {
    // reset to 1 on each state change
    setCount(1);
  }, [state]);

  return (
    <div {...props}>
      {label}
      {" . ".repeat(Math.abs(count))}
    </div>
  );
}
