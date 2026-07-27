import Link from "next/link";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";

// There's no customer account/auth system in this project yet (checkout is
// guest-only - see src/app/checkout), so there's no `userId` to look order
// history up by. Order History for guests is the /order-tracking lookup
// (order number + email) instead of a per-account list.
const AccountOrder = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-semibold">Order History</h2>
      <p className="text-slate-500 dark:text-slate-400">
        Orders are placed as a guest. Look up an order using its order number
        and the email address used at checkout.
      </p>
      <Link href={"/order-tracking" as any}>
        <ButtonPrimary>Track an order</ButtonPrimary>
      </Link>
    </div>
  );
};

export default AccountOrder;
