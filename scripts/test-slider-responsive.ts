import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { getObjectPositionClass } from "../src/lib/banners/position";
import { toHeroSlide } from "../src/lib/firebase/adapters";
import type { Banner } from "../src/types/banner";
import FullWidthImageHero from "../src/components/theme/variants/heroes/FullWidthImageHero";
import LuxeHero from "../src/components/theme/variants/heroes/LuxeHero";
import MinimalHero from "../src/components/theme/variants/heroes/MinimalHero";
import BoldStreetHero from "../src/components/theme/variants/heroes/BoldStreetHero";
import TechHero from "../src/components/theme/variants/heroes/TechHero";
import SectionPromo1 from "../src/components/SectionPromo1";
import SectionPromo2 from "../src/components/SectionPromo2";
import SectionPromo3 from "../src/components/SectionPromo3";

// Helper to make a mock banner
function makeBanner(overrides: Partial<Banner> = {}): Banner {
  return {
    id: "b-1",
    title: "Summer Collection",
    subtitle: "New season drops",
    imageDesktop: "/images/desktop-wide-1584x672.webp",
    placement: "hero",
    order: 0,
    isActive: true,
    ...overrides,
  };
}

test("position helper: maps all focal points to correct Tailwind classes with safe default", () => {
  assert.equal(getObjectPositionClass("left"), "object-left");
  assert.equal(getObjectPositionClass("right"), "object-right");
  assert.equal(getObjectPositionClass("top"), "object-top");
  assert.equal(getObjectPositionClass("bottom"), "object-bottom");
  assert.equal(getObjectPositionClass("center"), "object-center");
  assert.equal(getObjectPositionClass(undefined), "object-center");
  assert.equal(getObjectPositionClass("unknown" as any), "object-center");
});

test("toHeroSlide: preserves imageMobile and backgroundPosition (backward-compatible)", () => {
  // Existing banner without mobile image or position
  const legacyBanner = makeBanner();
  const legacySlide = toHeroSlide(legacyBanner);
  assert.equal(legacySlide.image, legacyBanner.imageDesktop);
  assert.equal(legacySlide.imageMobile, undefined);
  assert.equal(legacySlide.backgroundPosition, undefined);

  // New banner with mobile image and focal position
  const modernBanner = makeBanner({
    imageMobile: "/images/mobile-portrait-768x1376.webp",
    backgroundPosition: "left",
  });
  const modernSlide = toHeroSlide(modernBanner);
  assert.equal(modernSlide.image, modernBanner.imageDesktop);
  assert.equal(modernSlide.imageMobile, "/images/mobile-portrait-768x1376.webp");
  assert.equal(modernSlide.backgroundPosition, "left");
});

test("FullWidthImageHero: desktop-only image uses landscape aspect ratio on mobile to prevent cropping", () => {
  const slide = toHeroSlide(
    makeBanner({
      imageDesktop: "/images/wide-banner-1584x672.webp",
      backgroundPosition: "left", // subject/text near left edge
    })
  );

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(FullWidthImageHero, { data: [slide] })
  );

  // When no mobile image is set, mobile container uses aspect-[16/9] so wide landscape banners aren't cropped into squares
  assert.ok(html.includes("aspect-[16/9]"), "Expected aspect-[16/9] responsive container for desktop-only image");
  // Focal position class applied
  assert.ok(html.includes("object-left"), "Expected object-left to be applied from backgroundPosition");
  // Single image: no redundant arrows
  assert.ok(!html.includes("aria-label=\"Go to slide 2\""), "Single slide should not have pagination for slide 2");
});

test("FullWidthImageHero: mobile image provides dedicated mobile and desktop artwork and taller mobile container", () => {
  const slide = toHeroSlide(
    makeBanner({
      imageDesktop: "/images/desktop-1584x672.webp",
      imageMobile: "/images/mobile-768x1376.webp",
      backgroundPosition: "center",
    })
  );

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(FullWidthImageHero, { data: [slide] })
  );

  // Container adapts to comfortable height for portrait mobile image
  assert.ok(html.includes("h-[400px]"), "Expected taller mobile container when mobile image is present");
  // Renders both mobile (< md) and desktop (>= md) images
  assert.ok(html.includes("md:hidden"), "Expected md:hidden for mobile image");
  assert.ok(html.includes("hidden md:block"), "Expected hidden md:block for desktop image");
  assert.ok(html.includes("mobile-768x1376"), "Mobile image URL present");
  assert.ok(html.includes("desktop-1584x672"), "Desktop image URL present");
});

test("FullWidthImageHero: multiple slides support navigation, touch swipe classes, and pagination", () => {
  const slides = [
    toHeroSlide(makeBanner({ id: "1", title: "Slide 1" })),
    toHeroSlide(makeBanner({ id: "2", title: "Slide 2", imageMobile: "/images/m2.webp" })),
  ];

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(FullWidthImageHero, { data: slides })
  );

  // Navigation controls rendered for multi-slide
  assert.ok(html.includes("aria-label=\"Go to slide 1\""));
  assert.ok(html.includes("aria-label=\"Go to slide 2\""));
  // Touch support attributes present
  assert.ok(html.includes("select-none"), "Touch-friendly drag prevention active");
});

test("All hero variants: Luxe, Minimal, BoldStreet, Tech render responsive images and respect focal positions", () => {
  const slideWithMobile = toHeroSlide(
    makeBanner({
      imageDesktop: "/images/desk.webp",
      imageMobile: "/images/mob.webp",
      backgroundPosition: "top",
    })
  );

  // Luxe Hero
  const luxeHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(LuxeHero, { data: [slideWithMobile] })
  );
  assert.ok(luxeHtml.includes("md:hidden") && luxeHtml.includes("mob.webp"), "LuxeHero should support mobile image");
  assert.ok(luxeHtml.includes("object-top"), "LuxeHero should apply object-top");

  // Minimal Hero
  const minimalHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(MinimalHero, { data: [slideWithMobile] })
  );
  assert.ok(minimalHtml.includes("md:hidden") && minimalHtml.includes("mob.webp"), "MinimalHero should support mobile image");
  assert.ok(minimalHtml.includes("object-top"), "MinimalHero should apply object-top");

  // Bold Street Hero
  const boldHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(BoldStreetHero, { data: [slideWithMobile] })
  );
  assert.ok(boldHtml.includes("md:hidden") && boldHtml.includes("mob.webp"), "BoldStreetHero should support mobile image");
  assert.ok(boldHtml.includes("object-top"), "BoldStreetHero should apply object-top");

  // Tech Hero
  const techHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TechHero, { data: [slideWithMobile] })
  );
  assert.ok(techHtml.includes("md:hidden") && techHtml.includes("mob.webp"), "TechHero should support mobile image");
});

test("SectionPromo1, SectionPromo2, SectionPromo3: render responsive picture with mobile source and focal position", () => {
  const promoBanner = makeBanner({
    imageDesktop: "/images/promo-desk.webp",
    imageMobile: "/images/promo-mob.webp",
    backgroundPosition: "right",
  });

  const p1Html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(SectionPromo1, { banner: promoBanner })
  );
  assert.ok(p1Html.includes("<picture"), "SectionPromo1 uses picture element");
  assert.ok(p1Html.includes("media=\"(max-width: 767px)\""), "SectionPromo1 has mobile source query");
  assert.ok(p1Html.includes("object-right"), "SectionPromo1 respects object-right");

  const p2Html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(SectionPromo2, { banner: promoBanner })
  );
  assert.ok(p2Html.includes("<picture"), "SectionPromo2 uses picture element");
  assert.ok(p2Html.includes("media=\"(max-width: 767px)\""), "SectionPromo2 has mobile source query");
  assert.ok(p2Html.includes("object-right"), "SectionPromo2 respects object-right");

  const p3Html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(SectionPromo3, { banner: promoBanner })
  );
  assert.ok(p3Html.includes("<picture"), "SectionPromo3 uses picture element");
  assert.ok(p3Html.includes("media=\"(max-width: 767px)\""), "SectionPromo3 has mobile source query");
});
