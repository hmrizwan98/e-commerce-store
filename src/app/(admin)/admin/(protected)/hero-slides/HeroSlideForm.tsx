import React from "react";
import BannerForm from "@/components/admin/BannerForm";
import type { Banner } from "@/types/banner";

const HeroSlideForm: React.FC<{ mode: "create" | "edit"; slide?: Banner }> = ({ mode, slide }) => (
  <BannerForm mode={mode} banner={slide} placement="hero" />
);

export default HeroSlideForm;
