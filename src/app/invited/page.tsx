import { redirect } from "next/navigation";

/**
 * The party page moved to /luna. Invitations already went out carrying
 * /invited, so this stays — a dead link in someone's inbox is worse
 * than a redirect nobody sees.
 */
export default function InvitedRedirect() {
  redirect("/luna");
}
