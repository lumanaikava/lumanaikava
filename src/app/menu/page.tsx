import type { Metadata } from "next";
import MenuCard from "@/components/MenuCard";
import { currentMenu } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "The Lumanai craft kava bar's current menu — naktails, functional mocktails, kava shots.",
};

export default function MenuPage() {
  return <MenuCard menu={currentMenu} />;
}
