/** Shared CTA styles for the marketing site, so every button has the same shape,
 * height, hover lift and keyboard focus ring. Append width/size tweaks per use. */
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 " +
  "hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-6000 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950";

/** Brand gradient - the main action on a section. */
export const MKT_BTN_PRIMARY =
  `${BASE} px-7 py-3.5 text-base text-white bg-gradient-to-r from-primary-6000 via-indigo-600 to-indigo-700 ` +
  "shadow-lg shadow-primary-6000/25 hover:shadow-xl hover:shadow-primary-6000/35";

/** Outlined - the secondary action next to a primary one. */
export const MKT_BTN_SECONDARY =
  `${BASE} px-7 py-3.5 text-base font-semibold border border-neutral-300 dark:border-neutral-700 ` +
  "bg-white/80 dark:bg-neutral-900/70 backdrop-blur-sm text-neutral-800 dark:text-neutral-100 " +
  "hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm";

/** White button for dark sections. */
export const MKT_BTN_INVERSE =
  `${BASE} px-7 py-3.5 text-base text-neutral-900 bg-white hover:bg-neutral-100 shadow-xl ` +
  "focus-visible:ring-white focus-visible:ring-offset-neutral-900 dark:focus-visible:ring-offset-neutral-900";
