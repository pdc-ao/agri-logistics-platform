// src/app/dashboard/transformation/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewTransformationFacilityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    facilityName: '',
    description: '',
    facilityType: '',
    capacity: '',
    capacityUnit: '',
    addressLine1: '',
    city: '',
    country: 'Angola'
  });

  const facilityTypes = [
    { value: 'Milling', label: 'Moagem', icon: '🌾' },
    { value: 'Processing', label: 'Processamento', icon: '⚙️' },
    { value: 'Packaging', label: 'Embalagem', icon: '📦' },
    { value: 'Drying', label: 'Secagem', icon: '☀️' },
    { value: 'Sorting', label: 'Classificação', icon: '📊' },
    { value: 'Cleaning', label: 'Limpeza', icon: '🧽' },
    { value: 'Storage', label: 'Armazenamento', icon: '🏭' },
    { value: 'Cold_Storage', label: 'Câmara Fria', icon: '❄️' },
    { value: 'Juice_Production', label: 'Produção de Sucos', icon: '🧃' },
    { value: 'Oil_Extraction', label: 'Extração de Óleo', icon: '🫒' }
  ];

  const capacityUnits = [
    'kg/dia', 'toneladas/dia', 'litros/dia', 'm³/dia', 'unidades/dia'
  ];

  const cities = [
    'Luanda', 'Huambo', 'Lobito', 'Benguela', 'Lubango', 
    'Malanje', 'Namibe', 'Uíge', 'Soyo', 'Cabinda', 'Menongue'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/transformation/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseFloat(formData.capacity) : null
        }),
      });

      if (response.ok) {
        router.push('/dashboard/transformation');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao criar instalação');
      }
    } catch (err) {
      console.error('Error creating facility:', err);
      setError('Erro ao criar instalação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Instalação de Transformação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Instalação *
                  </label>
                  <input
                    type="text"
                    name="facilityName"
                    value={formData.facilityName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Centro de Processamento de Grãos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Instalação *
                  </label>
                  <select
                    name="facilityType"
                    value={formData.facilityType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    {facilityTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacidade
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="1000"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidade
                    </label>
                    <select
                      name="capacityUnit"
                      value={formData.capacityUnit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione</option>
                      {capacityUnits.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Rua, número, bairro"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Selecione a cidade</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Descreva os serviços, equipamentos disponíveis e diferenciais da sua instalação..."
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Criando...' : 'Criar Instalação'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl mb-2">🔄</div>
            <h3 className="font-medium text-blue-800 mb-1">Processamento</h3>
            <p className="text-sm text-blue-700">
              Transforme produtos agrícolas em valor agregado
            </p>
          </div>
        </Card>
        
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-medium text-green-800 mb-1">Eficiência</h3>
            <p className="text-sm text-green-700">
              Equipamentos modernos para máxima produtividade
            </p>
          </div>
        </Card>
        
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="text-center">
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="font-medium text-purple-800 mb-1">Parceria</h3>
            <p className="text-sm text-purple-700">
              Conecte-se com produtores e compradores
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}