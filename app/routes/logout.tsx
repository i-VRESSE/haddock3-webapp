import { redirect } from "@remix-run/node";
import { userPrefs } from "~/cookies";

export async function loader() {
    return redirect("/", {
        headers: {
          "Set-Cookie": await userPrefs.serialize({}),
        },
      });
}