import { json, type ActionArgs } from "@remix-run/node";
import { redirect } from "react-router";
import { availableSocialLogins } from "~/auth";
import { authenticator } from "~/auth.server";

export async function loader() {
  return redirect("/login");
}

export const action = async ({ params, request }: ActionArgs) => {
  const provider = params.provider || "";
  const socials = availableSocialLogins();
  if (!socials.includes(provider)) {
    throw json("Not found", { status: 404 });
  }
  return authenticator.authenticate(provider, request);
};
