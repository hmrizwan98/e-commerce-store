"use server";

import { revalidatePath } from "next/cache";
import {
  createGuestOrder,
  type CreateGuestOrderInput,
  type CreateGuestOrderResult,
} from "@/lib/firebase/repositories/orders";

export async function placeGuestOrder(
  input: CreateGuestOrderInput
): Promise<CreateGuestOrderResult> {
  const result = await createGuestOrder(input);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  return result;
}
