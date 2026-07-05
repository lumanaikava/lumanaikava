import { redirect } from "next/navigation";

export default function PrivateCateringRedirect() {
  redirect("/events");
}
