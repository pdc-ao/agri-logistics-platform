import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";

export default async function TransportPage() {
  // ✅ Ensure user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Example: fetch transport records (adapt to your schema)
  const transports = await db.transport.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      driver: { select: { id: true, username: true } },
      vehicle: { select: { id: true, plateNumber: true } },
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
                <h2 className="font-medium">Trip #{t.id}</h2>
                <p className="text-xs text-neutral-500">
                  Driver: {t.driver?.username || "Unassigned"} • Vehicle:{" "}
                  {t.vehicle?.plateNumber || "N/A"}
                </p>
              </div>
              <span className="text-sm text-neutral-600">
                Status: {t.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
