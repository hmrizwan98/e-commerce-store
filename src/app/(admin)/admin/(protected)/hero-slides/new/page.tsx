import React from "react";
import HeroSlideForm from "../HeroSlideForm";

export default function NewHeroSlidePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add hero slide</h1>
      <HeroSlideForm mode="create" />
    </div>
  );
}
