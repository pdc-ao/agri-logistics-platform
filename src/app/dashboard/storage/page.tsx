import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";

export default async function StoragePage() {
  // ✅ Ensure user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch storage listings
  const facilities = await db.storageListing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, username: true, fullName: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Storage Facilities</h1>
        
          href="/dashboard/storage/new"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add Storage Facility
        </a>
      </div>

      {facilities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">No storage facilities found.</p>
          
            href="/dashboard/storage/new"
            className="text-blue-600 hover:underline"
          >
            Create your first storage facility
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-semibold text-lg">{facility.facilityName}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    facility.availabilityStatus === "AVAILABLE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {facility.availabilityStatus}
                </span>
              </div>

              <p className="text-sm text-neutral-600 mb-2">
                {facility.storageType}
              </p>

              <div className="text-sm text-neutral-500 space-y-1 mb-3">
                <p>📍 {facility.city}, {facility.country}</p>
                <p>
                  Owner: {facility.owner?.fullName || facility.owner?.username || "N/A"}
                </p>
                {facility.totalCapacity && (
                  <p>
                    Capacity: {facility.totalCapacity} {facility.capacityUnit}
                  </p>
                )}
                {facility.availableCapacity && (
                  <p>
                    Available: {facility.availableCapacity} {facility.capacityUnit}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                
                  href={`/storage/${facility.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Details
                </a>
                {session.user.id === facility.ownerId && (
                  
                    href={`/dashboard/storage/${facility.id}/edit`}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Edit
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}