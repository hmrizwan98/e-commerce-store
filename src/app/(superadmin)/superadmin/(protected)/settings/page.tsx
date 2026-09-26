import React from "react";
import { getPlatformEmailSettingsAction } from "../actions";
import PlatformSettingsClient from "./PlatformSettingsClient";

export const dynamic = "force-dynamic";

export default async function PlatformSettingsPage() {
  const email = await getPlatformEmailSettingsAction();

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold mb-1">Platform Settings</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Configuration used platform-wide - not tied to any individual store.
      </p>
      <PlatformSettingsClient initialEmail={email} />
    </div>
  );
}
