"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import { createBanner, updateBanner, type BannerFormInput } from "@/lib/firebase/banner-actions";
import type { Banner, BannerAnimation, BannerBackgroundPosition, BannerPlacement, BannerTextAlign } from "@/types/banner";

const TEXT_ALIGN_OPTIONS: BannerTextAlign[] = ["left", "center", "right"];
const BACKGROUND_POSITION_OPTIONS: BannerBackgroundPosition[] = ["left", "center", "right", "top", "bottom"];
const ANIMATION_OPTIONS: BannerAnimation[] = ["fade", "slide", "zoom", "none"];

const PLACEMENT_CONFIG: Record<
  BannerPlacement,
  { createdMessage: string; createButtonLabel: string; listHref: string }
> = {
  hero: { createdMessage: "Hero slide created", createButtonLabel: "Create slide", listHref: "/admin/hero-slides" },
  promo1: { createdMessage: "Banner created", createButtonLabel: "Create banner", listHref: "/admin/promo-banners?placement=promo1" },
  promo2: { createdMessage: "Banner created", createButtonLabel: "Create banner", listHref: "/admin/promo-banners?placement=promo2" },
  promo3: { createdMessage: "Banner created", createButtonLabel: "Create banner", listHref: "/admin/promo-banners?placement=promo3" },
  "homepage-generic": { createdMessage: "Banner created", createButtonLabel: "Create banner", listHref: "/admin/promo-banners" },
};

export interface BannerFormProps {
  mode: "create" | "edit";
  banner?: Banner;
  placement: BannerPlacement;
}

const BannerForm: React.FC<BannerFormProps> = ({ mode, banner, placement }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(banner?.title ?? "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "");
  const [description, setDescription] = useState(banner?.description ?? "");
  const [badgeText, setBadgeText] = useState(banner?.badgeText ?? "");
  const [offerText, setOfferText] = useState(banner?.offerText ?? "");
  const [discountText, setDiscountText] = useState(banner?.discountText ?? "");

  const [imageDesktop, setImageDesktop] = useState<string[]>(banner?.imageDesktop ? [banner.imageDesktop] : []);
  const [imageMobile, setImageMobile] = useState<string[]>(banner?.imageMobile ? [banner.imageMobile] : []);

  const [ctaText, setCtaText] = useState(banner?.ctaText ?? "Explore now");
  const [ctaHref, setCtaHref] = useState(banner?.ctaHref ?? "/collection");
  const [ctaText2, setCtaText2] = useState(banner?.ctaText2 ?? "");
  const [ctaHref2, setCtaHref2] = useState(banner?.ctaHref2 ?? "");

  const [textAlign, setTextAlign] = useState<BannerTextAlign>(banner?.textAlign ?? "left");
  const [textColor, setTextColor] = useState(banner?.textColor ?? "");
  const [overlayColor, setOverlayColor] = useState(banner?.overlayColor ?? "");
  const [overlayOpacity, setOverlayOpacity] = useState(String(banner?.overlayOpacity ?? 0));
  const [backgroundPosition, setBackgroundPosition] = useState<BannerBackgroundPosition>(
    banner?.backgroundPosition ?? "center"
  );
  const [animation, setAnimation] = useState<BannerAnimation>(banner?.animation ?? "fade");

  const [order, setOrder] = useState(String(banner?.order ?? 0));
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [desktopUploading, setDesktopUploading] = useState(false);
  const [mobileUploading, setMobileUploading] = useState(false);

  const config = PLACEMENT_CONFIG[placement];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !imageDesktop[0]) {
      setError("Heading and a desktop image are required.");
      return;
    }
    const payload: BannerFormInput = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      badgeText: badgeText.trim() || undefined,
      offerText: offerText.trim() || undefined,
      discountText: discountText.trim() || undefined,
      ctaText: ctaText.trim() || undefined,
      ctaHref: ctaHref.trim() || undefined,
      ctaText2: ctaText2.trim() || undefined,
      ctaHref2: ctaHref2.trim() || undefined,
      imageDesktop: imageDesktop[0],
      imageMobile: imageMobile[0] || undefined,
      textAlign,
      textColor: textColor.trim() || undefined,
      overlayColor: overlayColor.trim() || undefined,
      overlayOpacity: overlayOpacity ? Number(overlayOpacity) : undefined,
      backgroundPosition,
      animation,
      order: Number(order) || 0,
      isActive,
    };
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createBanner(placement, payload);
        toast.success(config.createdMessage);
        router.push(config.listHref as any);
      } else if (banner) {
        await updateBanner(banner.id, payload);
        toast.success("Changes saved");
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
  const labelClass = "block text-sm font-medium mb-1";
  const cardClass =
    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";
  const sectionTitleClass = "text-sm font-semibold text-neutral-500 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Images</h2>
        <ImageUploader
          value={imageDesktop}
          onChange={setImageDesktop}
          imageType="bannerHero"
          multiple={false}
          label="Desktop image (required)"
          onUploadingChange={setDesktopUploading}
        />
        <ImageUploader
          value={imageMobile}
          onChange={setImageMobile}
          imageType="bannerHero"
          multiple={false}
          label="Mobile image (optional - falls back to desktop image)"
          onUploadingChange={setMobileUploading}
        />
        <div>
          <label className={labelClass}>Background position</label>
          <select
            className={inputClass}
            value={backgroundPosition}
            onChange={(e) => setBackgroundPosition(e.target.value as BannerBackgroundPosition)}
          >
            {BACKGROUND_POSITION_OPTIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos[0].toUpperCase() + pos.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Content</h2>
        <div>
          <label className={labelClass}>Badge text</label>
          <input className={inputClass} value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="e.g. New" />
        </div>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Sub-heading</label>
          <input className={inputClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Offer text</label>
            <input className={inputClass} value={offerText} onChange={(e) => setOfferText(e.target.value)} placeholder="e.g. Limited time offer" />
          </div>
          <div>
            <label className={labelClass}>Discount text</label>
            <input className={inputClass} value={discountText} onChange={(e) => setDiscountText(e.target.value)} placeholder="e.g. Up to 50% off" />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Buttons</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Primary button text</label>
            <input className={inputClass} value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Primary button link</label>
            <input className={inputClass} value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Secondary button text</label>
            <input className={inputClass} value={ctaText2} onChange={(e) => setCtaText2(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Secondary button link</label>
            <input className={inputClass} value={ctaHref2} onChange={(e) => setCtaHref2(e.target.value)} />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Appearance</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Text alignment</label>
            <select className={inputClass} value={textAlign} onChange={(e) => setTextAlign(e.target.value as BannerTextAlign)}>
              {TEXT_ALIGN_OPTIONS.map((align) => (
                <option key={align} value={align}>
                  {align[0].toUpperCase() + align.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Animation</label>
            <select className={inputClass} value={animation} onChange={(e) => setAnimation(e.target.value as BannerAnimation)}>
              {ANIMATION_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a[0].toUpperCase() + a.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Text color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={textColor || "#0f172a"} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-9 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent" />
              <input className={inputClass} value={textColor} onChange={(e) => setTextColor(e.target.value)} placeholder="Default" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Overlay color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={overlayColor || "#000000"} onChange={(e) => setOverlayColor(e.target.value)} className="w-10 h-9 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent" />
              <input className={inputClass} value={overlayColor} onChange={(e) => setOverlayColor(e.target.value)} placeholder="None" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Overlay opacity ({Math.round(Number(overlayOpacity || 0) * 100)}%)</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Visibility</h2>
        <div>
          <label className={labelClass}>Sort order</label>
          <input type="number" className={inputClass} value={order} onChange={(e) => setOrder(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting || desktopUploading || mobileUploading}
        className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {desktopUploading || mobileUploading
          ? "Uploading image…"
          : submitting
          ? "Saving…"
          : mode === "create"
          ? config.createButtonLabel
          : "Save changes"}
      </button>
    </form>
  );
};

export default BannerForm;
