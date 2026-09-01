"use client";

import { useState } from "react";
import type { SellingPlan } from "@/lib/integrations/shopify";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import { artworkFor, HIDE_PRICES } from "@/lib/shop-display";

type Variant = {
  variantId: string;
  title: string;
  amount: number;
  priceLabel: string;
  available: boolean;
};

/**
 * Size picker + artwork + Add to Cart, kept together.
 *
 * They have to be one component because choosing a size changes all
 * three at once — the price, the picture and what actually goes in the
 * cart. Splitting them would mean lifting state into the page and making
 * it a client component anyway.
 *
 * Products with a single variant render no picker at all.
 */
const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(n);

export default function ProductPurchase({
  handle,
  name,
  fallbackImage,
  imageAlt,
  variants,
  available,
  singleVariantId,
  singlePriceLabel,
  singleAmount,
  sellingPlans = [],
}: {
  handle: string;
  name: string;
  fallbackImage?: string;
  imageAlt: string;
  variants: Variant[];
  available: boolean;
  singleVariantId?: string;
  singlePriceLabel: string;
  singleAmount: number;
  sellingPlans?: SellingPlan[];
}) {
  const hasChoice = variants.length > 1;
  const [selectedId, setSelectedId] = useState(
    () =>
      (variants.find((v) => v.available) ?? variants[0])?.variantId ??
      singleVariantId ??
      "",
  );

  const chosen = variants.find((v) => v.variantId === selectedId);
  const variantId = chosen?.variantId ?? singleVariantId;
  const priceLabel = chosen?.priceLabel ?? singlePriceLabel;
  const amountBase = chosen?.amount ?? singleAmount;
  const inStock = chosen ? chosen.available : available;

  // "" means one-time. Deliberately the default: a recurring charge is
  // something the buyer opts into, never something they fail to opt out of.
  const [planId, setPlanId] = useState("");
  const plan = sellingPlans.find((p) => p.id === planId);
  const planAmount =
    plan?.percentOff != null
      ? Math.round(amountBase * (1 - plan.percentOff / 100) * 100) / 100
      : amountBase;

  const art = artworkFor(handle, chosen?.title) ?? fallbackImage;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="relative flex h-64 items-center justify-center sm:h-80 lg:h-[420px]">
        {art ? (
          <Image
            // Keyed on the source so switching size fades in the new
            // bottle rather than swapping it mid-frame.
            key={art}
            src={art}
            alt={imageAlt}
            width={420}
            height={900}
            sizes="(max-width: 1024px) 70vw, 40vw"
            className="h-full w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] duration-500 animate-in fade-in"
            priority
          />
        ) : (
          <div className="h-full w-full rounded-2xl border border-shell/10" />
        )}
      </div>

      <div>
        {hasChoice && (
          <fieldset className="mb-5">
            <legend className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/45">
              Size
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((v) => {
                const active = v.variantId === selectedId;
                return (
                  <label
                    key={v.variantId}
                    className={`cursor-pointer rounded-full border px-5 py-2 text-sm transition ${
                      active
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-shell/20 text-shell/70 hover:border-shell/45"
                    } ${v.available ? "" : "cursor-not-allowed opacity-40"}`}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={v.variantId}
                      checked={active}
                      disabled={!v.available}
                      onChange={() => setSelectedId(v.variantId)}
                      className="sr-only"
                    />
                    {v.title}
                    {!v.available && (
                      <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.15em] text-coconut">
                        out
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {sellingPlans.length > 0 && (
          <fieldset className="mt-1">
            <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
              Purchase options
            </legend>
            <div className="mt-3 space-y-2">
              <label
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                  planId === ""
                    ? "border-gold bg-gold/10"
                    : "border-shell/20 hover:border-shell/40"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="purchase-option"
                    className="accent-gold"
                    checked={planId === ""}
                    onChange={() => setPlanId("")}
                  />
                  <span className="text-sm text-shell">One-time purchase</span>
                </span>
                <span className="font-mono text-sm text-shell/70">
                  {money(amountBase)}
                </span>
              </label>

              {sellingPlans.map((sp) => {
                const price =
                  sp.percentOff != null
                    ? Math.round(amountBase * (1 - sp.percentOff / 100) * 100) / 100
                    : amountBase;
                const active = planId === sp.id;
                return (
                  <label
                    key={sp.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                      active
                        ? "border-gold bg-gold/10"
                        : "border-shell/20 hover:border-shell/40"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="purchase-option"
                        className="accent-gold"
                        checked={active}
                        onChange={() => setPlanId(sp.id)}
                      />
                      <span className="text-sm text-shell">
                        {sp.name}
                        {sp.percentOff != null && (
                          <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                            Save {sp.percentOff}%
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="font-mono text-sm text-gold">
                      {money(price)}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-shell/40">
              Subscriptions renew automatically. Skip, pause or cancel any
              time from the link in your order confirmation.
            </p>
          </fieldset>
        )}

        {!HIDE_PRICES && (
          <p className="font-mono text-2xl text-gold">
            {plan ? money(planAmount) : priceLabel}
          </p>
        )}

        <div className="mt-5">
          <AddToCartButton
            item={
              variantId
                ? {
                    variantId,
                    handle,
                    name,
                    variantName: hasChoice ? chosen?.title : undefined,
                    priceLabel: plan ? money(planAmount) : priceLabel,
                    amount: planAmount,
                    image: art,
                    ...(plan
                      ? {
                          sellingPlanId: plan.id,
                          sellingPlanName:
                            plan.percentOff != null
                              ? `${plan.name} · ${plan.percentOff}% off`
                              : plan.name,
                        }
                      : {}),
                  }
                : undefined
            }
            available={inStock}
            productName={name}
          />
        </div>
      </div>
    </div>
  );
}
