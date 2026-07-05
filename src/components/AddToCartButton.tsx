"use client";

import { useState } from "react";

export default function AddToCartButton({ productName }: { productName: string }) {
  const [clicked, setClicked] = useState(false);

  if (clicked) {
    return (
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-shell/60">
        Online checkout is being reconnected — email{" "}
        <a
          href="mailto:lumanai.events@gmail.com"
          className="text-gold underline underline-offset-2"
        >
          lumanai.events@gmail.com
        </a>{" "}
        to order {productName} in the meantime.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setClicked(true)}
      className="rounded-full bg-gold px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss transition-colors hover:bg-shell"
    >
      Add to Cart
    </button>
  );
}
