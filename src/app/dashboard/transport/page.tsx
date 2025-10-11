import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";

export default async function TransportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const transports = await db.transportListing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      transporter: { select: { id: true, username: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Transport Dashboard</h1>

      {transports.length === 0 ? (
        <p className="text-neutral-500">No transport records found.</p>
      ) : (
        <ul className="space-y-4">
          {transports.map((t) => (
            <li
              key={t.id}
              className="border rounded-md p-4 flex items-center justify-between"
            >
              <div>
                <h2 className="font-medium">{t.serviceTitle}</h2>
                <p className="text-xs text-neutral-500">
                  Transporter: {t.transporter?.username || "Unassigned"} • Vehicle Type:{" "}
                  {t.vehicleType}
                </p>
              </div>
              <span className="text-sm text-neutral-600">
                Status: {t.availabilityStatus}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
