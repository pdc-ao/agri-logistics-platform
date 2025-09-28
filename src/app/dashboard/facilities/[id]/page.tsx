'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FacilityDetail {
  id: string;
  facilityName: string;
  facilityType?: string;
  capacity?: number;
  capacityUnit?: string;
  description?: string;
  addressLine1: string;
  city: string;
  country: string;
}

export default function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [facility, setFacility] = useState<FacilityDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/facilities/${id}`); // Not implemented
        if (res.ok) {
          const data = await res.json();
          setFacility(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-sm text-gray-500">Carregando...</div>
      ) : !facility ? (
        <div className="text-sm text-gray-500">Instalação não encontrada</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-800">{facility.facilityName}</h1>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="border rounded p-4 bg-white">
                <h2 className="font-semibold mb-2">Detalhes</h2>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Tipo:</span> {facility.facilityType || '—'}</div>
                  <div><span className="font-medium">Capacidade:</span> {facility.capacity ? `${facility.capacity} ${facility.capacityUnit}` : '—'}</div>
                  <div><span className="font-medium">Cidade:</span> {facility.city}</div>
                  <div><span className="font-medium">País:</span> {facility.country}</div>
                </div>
              </div>
              <div className="border rounded p-4 bg-white">
                <h2 className="font-semibold mb-2">Descrição</h2>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {facility.description || 'Sem descrição'}
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="border rounded p-4 bg-white">
                <h2 className="font-semibold mb-2">Ações</h2>
                <div className="flex flex-col gap-2 text-sm">
                  <button className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
                    Editar (placeholder)
                  </button>
                  <button className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
                    Excluir (placeholder)
                  </button>
                </div>
              </div>
              <div className="border rounded p-4 bg-white">
                <h2 className="font-semibold mb-2">Processos Atuais</h2>
                <p className="text-xs text-gray-500">
                  (Integração futura com jobs de transformação.)
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      <p className="text-xs text-gray-400">
        (API de facilities ainda não disponível.)
      </p>
    </div>
  );
}