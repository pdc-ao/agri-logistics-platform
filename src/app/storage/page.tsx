'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StorageListing {
  id: string;
  facilityName: string;
  description: string;
  storageType: string;
  totalCapacity?: number;
  capacityUnit?: string;
  availableCapacity?: number;
  pricingStructure: string;
  addressLine1: string;
  city: string;
  availabilityStatus: string;
  owner: {
    id: string;
    username: string;
    fullName?: string;
    averageRating?: number;
  };
}

export default function StoragePage() {
  const [storageListings, setStorageListings] = useState<StorageListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const cities = [
    'Luanda', 'Huambo', 'Lobito', 'Benguela', 'Lubango', 
    'Malanje', 'Namibe', 'Uíge', 'Soyo', 'Cabinda'
  ];

  const storageTypes = [
    'Armazém Frigorífico', 'Armazém Seco', 'Silo', 'Depósito', 
    'Câmara Fria', 'Armazém Ventilado', 'Outros'
  ];

  useEffect(() => {
    fetchStorageListings();
  }, [selectedCity, selectedType]);

  const fetchStorageListings = async () => {
    try {
      let url = '/api/storage?';
      const params = new URLSearchParams();
      
      if (selectedCity) params.append('city', selectedCity);
      if (selectedType) params.append('storageType', selectedType);
      
      const response = await fetch(`/api/storage?${params.toString()}`);
      const data = await response.json();
      setStorageListings(data);
    } catch (error) {
      console.error('Error fetching storage listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Soluções de Armazenamento</h1>
        <p className="text-gray-600">Encontre o armazenamento ideal para seus produtos agrícolas</p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Todas as cidades</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Armazenamento</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            {storageTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={() => {
              setSelectedCity('');
              setSelectedType('');
            }}
            variant="outline"
            className="w-full"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Storage Listings Grid */}
      {storageListings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Nenhum armazém encontrado
          </h3>
          <p className="text-gray-600">
            Não há armazéns disponíveis com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storageListings.map((storage) => (
            <Card key={storage.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {storage.facilityName}
                </CardTitle>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {storage.storageType}
                  </span>
                  <div className="flex items-center">
                    <span className="text-green-600">📍</span>
                    <span className="ml-1">{storage.city}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-gray-600 text-sm line-clamp-3">
                  {storage.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  {storage.totalCapacity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacidade Total:</span>
                      <span className="font-medium">
                        {storage.totalCapacity} {storage.capacityUnit}
                      </span>
                    </div>
                  )}
                  
                  {storage.availableCapacity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponível:</span>
                      <span className="font-medium text-green-600">
                        {storage.availableCapacity} {storage.capacityUnit}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proprietário:</span>
                    <div className="flex items-center">
                      <span className="font-medium">
                        {storage.owner.fullName || storage.owner.username}
                      </span>
                      {storage.owner.averageRating && (
                        <div className="flex items-center ml-2">
                          <span className="text-yellow-500">★</span>
                          <span className="text-xs">{storage.owner.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-gray-600 text-xs mb-1">Preços:</div>
                    <div className="font-medium text-sm">{storage.pricingStructure}</div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      storage.availabilityStatus === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : storage.availabilityStatus === 'PartiallyAvailable'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {storage.availabilityStatus === 'Available' 
                        ? 'Disponível' 
                        : storage.availabilityStatus === 'PartiallyAvailable'
                        ? 'Parcialmente Disponível'
                        : 'Indisponível'
                      }
                    </span>
                    <span className="text-xs text-gray-500">{storage.addressLine1}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Contactar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Tem um armazém para oferecer?
        </h2>
        <p className="text-gray-600 mb-6">
          Cadastre seu espaço de armazenamento e conecte-se com produtores que precisam de seus serviços
        </p>
        <Button className="bg-green-600 hover:bg-green-700">
          Cadastrar Armazém
        </Button>
      </div>
    </div>
  );
}