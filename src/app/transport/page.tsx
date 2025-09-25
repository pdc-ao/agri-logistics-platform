'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransportListing {
  id: string;
  serviceTitle: string;
  description?: string;
  vehicleType: string;
  carryingCapacityWeight?: number;
  capacityWeightUnit?: string;
  carryingCapacityVolume?: number;
  capacityVolumeUnit?: string;
  operationalRoutes?: string;
  pricingModel: string;
  baseLocationCity: string;
  availabilityStatus: string;
  transporter: {
    id: string;
    username: string;
    fullName?: string;
    averageRating?: number;
  };
}

export default function TransportPage() {
  const [transportListings, setTransportListings] = useState<TransportListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');

  const cities = [
    'Luanda', 'Huambo', 'Lobito', 'Benguela', 'Lubango', 
    'Malanje', 'Namibe', 'Uíge', 'Soyo', 'Cabinda'
  ];

  const vehicleTypes = [
    'Caminhão', 'Camioneta', 'Van Refrigerada', 'Caminhão Frigorífico', 
    'Reboque', 'Caminhão Basculante', 'Pick-up', 'Outros'
  ];

  useEffect(() => {
    fetchTransportListings();
  }, [selectedCity, selectedVehicleType]);

  const fetchTransportListings = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.append('baseLocationCity', selectedCity);
      if (selectedVehicleType) params.append('vehicleType', selectedVehicleType);
      
      const response = await fetch(`/api/transport?${params.toString()}`);
      const data = await response.json();
      setTransportListings(data || []);
    } catch (error) {
      console.error('Error fetching transport listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Serviços de Transporte</h1>
        <p className="text-gray-600">Encontre soluções de transporte confiáveis para seus produtos</p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cidade Base</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Veículo</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedVehicleType}
            onChange={(e) => setSelectedVehicleType(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={() => {
              setSelectedCity('');
              setSelectedVehicleType('');
            }}
            variant="outline"
            className="w-full"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Transport Listings Grid */}
      {transportListings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚚</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Nenhum transporte encontrado
          </h3>
          <p className="text-gray-600">
            Não há serviços de transporte disponíveis com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transportListings.map((transport) => (
            <Card key={transport.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {transport.serviceTitle}
                </CardTitle>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {transport.vehicleType}
                  </span>
                  <div className="flex items-center">
                    <span className="text-green-600">📍</span>
                    <span className="ml-1">{transport.baseLocationCity}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {transport.description && (
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {transport.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  {transport.carryingCapacityWeight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacidade (Peso):</span>
                      <span className="font-medium">
                        {transport.carryingCapacityWeight} {transport.capacityWeightUnit || 'kg'}
                      </span>
                    </div>
                  )}
                  
                  {transport.carryingCapacityVolume && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacidade (Volume):</span>
                      <span className="font-medium">
                        {transport.carryingCapacityVolume} {transport.capacityVolumeUnit || 'm³'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transportador:</span>
                    <div className="flex items-center">
                      <span className="font-medium">
                        {transport.transporter.fullName || transport.transporter.username}
                      </span>
                      {transport.transporter.averageRating && (
                        <div className="flex items-center ml-2">
                          <span className="text-yellow-500">★</span>
                          <span className="text-xs">{transport.transporter.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {transport.operationalRoutes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rotas:</span>
                      <span className="text-xs text-right max-w-32 truncate">
                        {transport.operationalRoutes}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <div className="text-gray-600 text-xs mb-1">Modelo de Preços:</div>
                    <div className="font-medium text-sm">{transport.pricingModel}</div>
                  </div>
                  
                  <div className="flex justify-center pt-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      transport.availabilityStatus === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transport.availabilityStatus === 'Available' ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
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
          Oferece serviços de transporte?
        </h2>
        <p className="text-gray-600 mb-6">
          Cadastre seus serviços de transporte e conecte-se com produtores que precisam mover suas mercadorias
        </p>
        <Button className="bg-green-600 hover:bg-green-700">
          Cadastrar Serviço
        </Button>
      </div>
    </div>
  );
}