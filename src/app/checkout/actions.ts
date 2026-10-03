"use server";

import {
  createGuestOrder,
  type CreateGuestOrderInput,
  type CreateGuestOrderResult,
} from "@/lib/firebase/repositories/orders";

/** No revalidatePath() here: the admin pages that list orders/inventory are already
 * `force-dynamic`, so revalidating them did nothing - except make Next.js re-render the
 * whole checkout page into this action's response, a slow extra round of Firestore reads
 * on the customer's critical path. */
export async function placeGuestOrder(
  input: CreateGuestOrderInput
): Promise<CreateGuestOrderResult> {
  return createGuestOrder(input);
}
