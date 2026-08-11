import Link from "next/link";
import { headers } from "next/headers";
import Label from "@/components/Label/Label";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { getOrderByOrderNumber } from "@/lib/firebase/repositories/orders";
import { checkRateLimit } from "@/lib/firebase/rate-limit";
import { getCurrentTenant } from "@/lib/tenant/current";
import type { Order } from "@/types/order";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const OrderTrackingPage = async ({
  searchParams,
}: {
  searchParams: { orderNumber?: string; email?: string };
}) => {
  const orderNumber = searchParams.orderNumber?.trim();
  const email = searchParams.email?.trim();
  const searched = Boolean(orderNumber && email);

  let isRateLimited = false;
  let order: Order | null = null;

  if (searched && orderNumber && email) {
    const reqHeaders = headers();
    const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || reqHeaders.get("x-real-ip") || "anonymous";
    const tenant = await getCurrentTenant();
    const rateLimitKey = `${tenant?.id || "default"}:${ip}`;
    const rateCheck = await checkRateLimit("tracking", rateLimitKey);

    if (!rateCheck.allowed) {
      isRateLimited = true;
    } else {
      order = await getOrderByOrderNumber(orderNumber);
    }
  }

  const matched =
    order && order.guestEmail?.toLowerCase() === email?.toLowerCase() ? order : null;

  return (
    <div className="container py-16 lg:pb-28 lg:pt-20 max-w-2xl">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-10">
        Track your order
      </h2>

      <form method="get" className="space-y-5 max-w-md">
        <div>
          <Label className="text-sm">Order number</Label>
          <Input
            className="mt-1.5"
            name="orderNumber"
            defaultValue={orderNumber}
            placeholder="ORD-XXXXXXXX"
            required
          />
        </div>
        <div>
          <Label className="text-sm">Email address</Label>
          <Input
            className="mt-1.5"
            type="email"
            name="email"
            defaultValue={email}
            required
          />
        </div>
        <ButtonPrimary type="submit">Track order</ButtonPrimary>
      </form>

      {searched && isRateLimited && (
        <p className="mt-8 text-sm text-red-600 font-medium">
          Too many tracking attempts. Please try again in a few minutes.
        </p>
      )}

      {searched && !isRateLimited && !matched && (
        <p className="mt-8 text-sm text-red-600">
          We couldn&apos;t find an order matching that order number and email.
        </p>
      )}

      {matched && (
        <div className="mt-10 space-y-8">
          <div>
            <h3 className="text-lg font-semibold">
              Order {matched.orderNumber}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Status:{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {STATUS_LABELS[matched.orderStatus] ?? matched.orderStatus}
              </span>
              {matched.trackingNumber && (
                <span className="ml-3">Tracking #: {matched.trackingNumber}</span>
              )}
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700 border-y border-slate-200 dark:border-slate-700">
            {matched.items.map((item) => (
              <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex justify-between py-4 text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">${item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="text-sm space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${matched.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${matched.shippingCost.toFixed(2)}</span>
            </div>
            {matched.tax != null && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${matched.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total</span>
              <span>${matched.total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Shipping address</h4>
            <p className="text-sm text-slate-500">
              {matched.shippingAddress.fullName}
              <br />
              {matched.shippingAddress.line1}
              {matched.shippingAddress.line2 ? `, ${matched.shippingAddress.line2}` : ""}
              <br />
              {matched.shippingAddress.city}
              {matched.shippingAddress.state ? `, ${matched.shippingAddress.state}` : ""}{" "}
              {matched.shippingAddress.postalCode}
              <br />
              {matched.shippingAddress.country}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Status history</h4>
            <ul className="text-sm text-slate-500 space-y-1">
              {matched.statusHistory.map((h, i) => (
                <li key={i}>
                  {STATUS_LABELS[h.status] ?? h.status} —{" "}
                  {new Date(h.at).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <p className="mt-10 text-sm text-slate-500">
        <Link href="/collection" className="underline">
          Continue shopping
        </Link>
      </p>
    </div>
  );
};

export default OrderTrackingPage;
