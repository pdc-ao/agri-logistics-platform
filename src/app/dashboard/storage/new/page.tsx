'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StorageForm } from '@/components/forms/storage-form';

export default function NewStoragePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: {
    facilityName: string;
    description: string;
    storageType: string;
    totalCapacity?: number;
    capacityUnit?: string;
    availableCapacity?: number;
    amenities?: string[];
    pricingStructure: string;
    responsibilities?: string;
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
    latitude: number;
    longitude: number;
    imagesUrls?: string[];
    availabilityStatus: string;
  }) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          ownerId: 'current-user-id', // This should come from auth context
        }),
      });

      if (response.ok) {
        router.push('/dashboard/storage');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao criar instalação de armazenamento');
      }
    } catch (err) {
      console.error('Error creating storage:', err);
      setError('Erro ao criar instalação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nova Instalação de Armazenamento</h1>
        <p className="text-gray-600">Cadastre seu espaço de armazenamento na plataforma</p>
      </div>

      <StorageForm 
        onSubmit={handleSubmit}
        isLoading={loading}
        error={error}
      />
    </div>
  );
}