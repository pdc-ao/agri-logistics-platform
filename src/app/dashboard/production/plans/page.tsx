import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function PlansPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // You could redirect to login instead if you prefer
    return notFound();
  }

  // Fetch all plans for now — you can filter by producerId if needed
  const plans = await db.productionPlan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      producer: { select: { id: true, username: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Production Plans</h1>

      {plans.length === 0 ? (
        <p className="text-neutral-500">No production plans found.</p>
      ) : (
        <ul className="space-y-4">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="border rounded-md p-4 flex items-center justify-between"
            >
              <div>
                <h2 className="font-medium">
                  <Link
                    href={`/dashboard/production/plans/${plan.id}`}
                    className="hover:underline"
                  >
                    {plan.productName}
                  </Link>
                  {plan.variety && (
                    <span className="ml-2 text-sm text-neutral-500">
                      ({plan.variety})
                    </span>
                  )}
                </h2>
                <p className="text-xs text-neutral-500">
                  Producer: {plan.producer.username} • Area: {plan.areaSize}{" "}
                  {plan.areaUnit}
                </p>
              </div>
              <StatusBadge status={plan.status} kind="production" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
