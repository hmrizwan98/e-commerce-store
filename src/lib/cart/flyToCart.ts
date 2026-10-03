"use client";

/**
 * Add-to-cart flourish: a small copy of the product image arcs from where the shopper
 * clicked into the header cart icon (any element marked `data-cart-icon` - see
 * CartDropdown.tsx), which then "bumps". Pure DOM + Web Animations API, no dependency;
 * purely decorative, so every failure path is a silent no-op and it never touches the cart.
 */
function bump(target: HTMLElement) {
  target.classList.remove("cart-bump");
  void target.offsetWidth; // restart the animation if it's already running
  target.classList.add("cart-bump");
  window.setTimeout(() => target.classList.remove("cart-bump"), 500);
}

function visibleCartIcon(): HTMLElement | null {
  const icons = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-icon]"));
  return icons.find((el) => el.getClientRects().length > 0) ?? null;
}

export function flyToCart(source?: Element | null, imageUrl?: string) {
  if (typeof window === "undefined") return;
  try {
    const target = visibleCartIcon();
    if (!target) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !("animate" in Element.prototype)) {
      bump(target);
      return;
    }

    // Start from the clicked control; fall back to the focused element, then screen center.
    const origin =
      source ?? (document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null);
    const a = origin?.getBoundingClientRect() ?? new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0);
    const b = target.getBoundingClientRect();
    const size = 56;
    const startX = a.left + a.width / 2 - size / 2;
    const startY = a.top + a.height / 2 - size / 2;
    const dx = b.left + b.width / 2 - (startX + size / 2);
    const dy = b.top + b.height / 2 - (startY + size / 2);

    const flyer = document.createElement("div");
    flyer.setAttribute("aria-hidden", "true");
    Object.assign(flyer.style, {
      position: "fixed",
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "9999px",
      zIndex: "9999",
      pointerEvents: "none",
      boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.35)",
      border: "2px solid #fff",
      backgroundColor: "rgb(var(--c-primary-600, 79 70 229))",
      backgroundImage: imageUrl ? `url("${imageUrl.replace(/"/g, "%22")}")` : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(flyer);

    const animation = flyer.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.45}px, ${Math.min(dy * 0.45, 0) - 90}px) scale(0.85)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.5 },
      ],
      { duration: 800, easing: "cubic-bezier(0.45, 0, 0.55, 1)" }
    );
    const finish = () => {
      flyer.remove();
      bump(target);
    };
    animation.onfinish = finish;
    animation.oncancel = () => flyer.remove();
  } catch {
    // decorative only
  }
}
