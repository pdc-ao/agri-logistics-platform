// src/app/dashboard/storage/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";

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

  async function handleDeleteStorage(id: string) {
    "use server";
    // implement API call or server action to delete facility
  }

  async function toggleAvailability(id: string, currentStatus: string) {
    "use server";
    // implement API call or server action to toggle availability
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Storage Facilities</h1>
      {facilities.length === 0 ? (
        <p className="text-neutral-500">No storage facilities found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <div key={facility.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{facility.facilityName}</h3>
                  <p className="text-sm text-gray-600">{facility.city}</p>
                  <p className="text-xs text-neutral-500">
                    Owner: {facility.owner?.username || "Unassigned"}
                  </p>
                </div>

                {/* Action Menu */}
                <div className="flex space-x-2">
                  <Link href={`/dashboard/storage/${facility.id}/edit`}>
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      ✏️
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteStorage(facility.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{facility.storageType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacidade:</span>
                  <span className="font-medium">
                    {facility.totalCapacity} {facility.capacityUnit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Disponível:</span>
                  <span className="font-medium">
                    {facility.availableCapacity} {facility.capacityUnit}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    facility.availabilityStatus === "AVAILABLE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {facility.availabilityStatus}
                </span>

                {/* Toggle availability */}
                <button
                  onClick={() =>
                    toggleAvailability(facility.id, facility.availabilityStatus)
                  }
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Alterar Status
                </button>
              </div>

              <div className="flex space-x-2">
                <Link href={`/storage/${facility.id}`} className="flex-1">
                  <button className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    👁️ Ver Público
                  </button>
                </Link>
                <Link
                  href={`/dashboard/storage/${facility.id}/bookings`}
                  className="flex-1"
                >
                  <button className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                    📅 Reservas
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
