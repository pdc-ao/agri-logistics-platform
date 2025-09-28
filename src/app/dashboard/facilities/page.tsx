'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Facility {
  id: string;
  facilityName: string;
  facilityType?: string;
  capacity?: number;
  capacityUnit?: string;
  city: string;
  country: string;
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const ownerId = 'replace-with-session-id';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/facilities?ownerId=${ownerId}`); // API NOT IMPLEMENTED yet
        if (res.ok) {
          const data = await res.json();
          setFacilities(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ownerId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Instalações de Transformação</h1>
        <Link
          href="/dashboard/facilities/new"
          className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Nova Instalação
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Carregando...</div>
      ) : facilities.length === 0 ? (
        <div className="text-sm text-gray-500">Nenhuma instalação ainda</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map(f => (
            <Link
              key={f.id}
              href={`/dashboard/facilities/${f.id}`}
              className="border rounded p-4 bg-white hover:shadow"
            >
              <div className="font-semibold text-gray-800">{f.facilityName}</div>
              <div className="text-xs text-gray-500 mt-1">
                {f.facilityType || 'Tipo não informado'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {f.city} - {f.country}
              </div>
              {f.capacity && (
                <div className="text-xs text-gray-600 mt-1">
                  Capacidade: {f.capacity} {f.capacityUnit}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="p-4 border rounded bg-gray-50 text-xs text-gray-500">
        (API de facilities não implementada; páginas são placeholders.)
      </div>
    </div>
  );
}