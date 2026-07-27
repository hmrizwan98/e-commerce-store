/** Cloud name is not secret - safe to read in client components. Never import server.ts from the browser. */
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
