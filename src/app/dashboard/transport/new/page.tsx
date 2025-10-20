// src/dashboard/transport/new/page.tsx
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';

export default async function NewTransportPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== 'TRANSPORTER') {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Acesso Negado</h2>
        <p className="mt-2">Apenas transportadores podem criar serviços de transporte.</p>
        <a href="/dashboard" className="text-blue-600 mt-4 block">Voltar ao Dashboard</a>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Criar Serviço de Transporte</h1>
      
      <form action="/api/transport" method="POST" className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Service Title */}
        <div>
          <label htmlFor="serviceTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Título do Serviço <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="serviceTitle"
            name="serviceTitle"
            required
            placeholder="Ex: Transporte de Carga Pesada - Luanda"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Descreva os seus serviços de transporte..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Vehicle Type */}
        <div>
          <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Veículo <span className="text-red-500">*</span>
          </label>
          <select
            id="vehicleType"
            name="vehicleType"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Selecione o tipo</option>
            <option value="Camião Ligeiro">Camião Ligeiro</option>
            <option value="Camião Pesado">Camião Pesado</option>
            <option value="Carrinha">Carrinha</option>
            <option value="Camião Frigorífico">Camião Frigorífico</option>
            <option value="Camião Cisterna">Camião Cisterna</option>
            <option value="Reboque">Reboque</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="carryingCapacityWeight" className="block text-sm font-medium text-gray-700 mb-1">
              Capacidade de Peso
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                id="carryingCapacityWeight"
                name="carryingCapacityWeight"
                step="0.01"
                placeholder="5000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                name="capacityWeightUnit"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="kg">kg</option>
                <option value="ton">ton</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="carryingCapacityVolume" className="block text-sm font-medium text-gray-700 mb-1">
              Capacidade de Volume
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                id="carryingCapacityVolume"
                name="carryingCapacityVolume"
                step="0.01"
                placeholder="20"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                name="capacityVolumeUnit"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="m³">m³</option>
                <option value="l">l</option>
              </select>
            </div>
          </div>
        </div>

        {/* Operational Routes */}
        <div>
          <label htmlFor="operationalRoutes" className="block text-sm font-medium text-gray-700 mb-1">
            Rotas Operacionais
          </label>
          <input
            type="text"
            id="operationalRoutes"
            name="operationalRoutes"
            placeholder="Ex: Luanda - Benguela - Huambo"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Primary Destination Type */}
        <div>
          <label htmlFor="primaryDestinationType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Destino Principal
          </label>
          <select
            id="primaryDestinationType"
            name="primaryDestinationType"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Selecione</option>
            <option value="Urbano">Urbano</option>
            <option value="Inter-Provincial">Inter-Provincial</option>
            <option value="Rural">Rural</option>
            <option value="Internacional">Internacional</option>
          </select>
        </div>

        {/* Pricing Model */}
        <div>
          <label htmlFor="pricingModel" className="block text-sm font-medium text-gray-700 mb-1">
            Modelo de Preços <span className="text-red-500">*</span>
          </label>
          <select
            id="pricingModel"
            name="pricingModel"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Selecione</option>
            <option value="Por Km">Por Km</option>
            <option value="Por Viagem">Por Viagem</option>
            <option value="Por Hora">Por Hora</option>
            <option value="Por Peso">Por Peso</option>
            <option value="Negociável">Negociável</option>
          </select>
        </div>

        {/* Base Location */}
        <div>
          <label htmlFor="baseLocationCity" className="block text-sm font-medium text-gray-700 mb-1">
            Cidade Base <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="baseLocationCity"
            name="baseLocationCity"
            required
            placeholder="Luanda"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Insurance Details */}
        <div>
          <label htmlFor="insuranceDetails" className="block text-sm font-medium text-gray-700 mb-1">
            Detalhes do Seguro
          </label>
          <textarea
            id="insuranceDetails"
            name="insuranceDetails"
            rows={3}
            placeholder="Informações sobre cobertura de seguro..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Availability Status */}
        <div>
          <label htmlFor="availabilityStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Status de Disponibilidade <span className="text-red-500">*</span>
          </label>
          <select
            id="availabilityStatus"
            name="availabilityStatus"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="AVAILABLE">Disponível</option>
            <option value="BUSY">Ocupado</option>
            <option value="UNAVAILABLE">Indisponível</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Criar Serviço de Transporte
          </button>
          <a
            href="/dashboard/transport"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}