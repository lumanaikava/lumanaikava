"use client";

import { useState } from "react";
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
  const amount = chosen?.amount ?? singleAmount;
  const inStock = chosen ? chosen.available : available;

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

        {!HIDE_PRICES && (
          <p className="font-mono text-2xl text-gold">{priceLabel}</p>
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
                    priceLabel,
                    amount,
                    image: art,
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
