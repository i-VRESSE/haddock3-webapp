import { json, type ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "react-router";
import { availableSocialLogins } from "~/auth";
import { authenticator } from "~/auth.server";
import { disabledInPortalMode } from "~/portal.server";

export async function loader() {
  disabledInPortalMode();
  return redirect("/login");
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  disabledInPortalMode();
  const provider = params.provider || "";
  const socials = availableSocialLogins();
  if (!socials.includes(provider)) {
    throw json("Not found", { status: 404 });
  }
  return authenticator.authenticate(provider, request);
};
