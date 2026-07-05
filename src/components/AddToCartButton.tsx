"use client";

import { useState } from "react";

export default function AddToCartButton({ productName }: { productName: string }) {
  const [clicked, setClicked] = useState(false);

  if (clicked) {
    return (
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink/60">
        Online checkout is being connected — reach out via the{" "}
        <a href="/contact" className="text-jade underline underline-offset-2">
          contact page
        </a>{" "}
        to order {productName} in the meantime.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setClicked(true)}
      className="rounded-full bg-ink px-8 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:bg-jade"
    >
      Add to Cart
    </button>
  );
}
