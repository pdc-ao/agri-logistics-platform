import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";

export default async function StoragePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const facilities = await db.storageListing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, username: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Storage Facilities</h1>
      {facilities.length === 0 ? (
        <p className="text-neutral-500">No storage facilities found.</p>
      ) : (
        <ul className="space-y-4">
          {facilities.map((facility) => (
            <li
              key={facility.id}
              className="border rounded-md p-4 flex items-center justify-between"
            >
              <div>
                <h2 className="font-medium">{facility.facilityName}</h2>
                <p className="text-xs text-neutral-500">
                  Owner: {facility.owner?.username || "Unassigned"}
                </p>
              </div>
              <span className="text-sm text-neutral-600">
                Capacity: {facility.totalCapacity ?? 0}{" "}
                {facility.capacityUnit || ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
