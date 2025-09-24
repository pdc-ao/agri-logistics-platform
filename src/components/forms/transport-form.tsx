import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface TransportFormProps {
  onSubmit: (data: {
    serviceTitle: string;
    description?: string;
    vehicleType: string;
    carryingCapacityWeight?: number;
    capacityWeightUnit?: string;
    carryingCapacityVolume?: number;
    capacityVolumeUnit?: string;
    operationalRoutes?: string;
    primaryDestinationType?: string;
    pricingModel: string;
    baseLocationCity: string;
    baseLocationCountry: string;
    availabilityStatus: string;
    insuranceDetails?: string;
    imagesUrls?: string[];
  }) => void;
  isLoading?: boolean;
  error?: string;
  initialData?: any;
  isEditing?: boolean;
}

export const TransportForm: React.FC<TransportFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = React.useState({
    serviceTitle: initialData?.serviceTitle || '',
    description: initialData?.description || '',
    vehicleType: initialData?.vehicleType || '',
    carryingCapacityWeight: initialData?.carryingCapacityWeight || '',
    capacityWeightUnit: initialData?.capacityWeightUnit || '',
    carryingCapacityVolume: initialData?.carryingCapacityVolume || '',
    capacityVolumeUnit: initialData?.capacityVolumeUnit || '',
    operationalRoutes: initialData?.operationalRoutes || '',
    primaryDestinationType: initialData?.primaryDestinationType || '',
    pricingModel: initialData?.pricingModel || '',
    baseLocationCity: initialData?.baseLocationCity || '',
    baseLocationCountry: initialData?.baseLocationCountry || 'Angola',
    availabilityStatus: initialData?.availabilityStatus || 'Available',
    insuranceDetails: initialData?.insuranceDetails || '',
    imagesUrls: initialData?.imagesUrls || [],
  });
  
  const [formError, setFormError] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
  };

  const addImage = () => {
    if (imageUrl && !formData.imagesUrls.includes(imageUrl)) {
      setFormData((prev) => ({
        ...prev,
        imagesUrls: [...prev.imagesUrls, imageUrl],
      }));
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagesUrls: prev.imagesUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validação básica
    if (!formData.serviceTitle || !formData.vehicleType || 
        !formData.pricingModel || !formData.baseLocationCity) {
      setFormError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    onSubmit({
      ...formData,
      carryingCapacityWeight: formData.carryingCapacityWeight ? Number(formData.carryingCapacityWeight) : undefined,
      carryingCapacityVolume: formData.carryingCapacityVolume ? Number(formData.carryingCapacityVolume) : undefined,
    });
  };

  const vehicleTypeOptions = [
    { value: 'caminhao_pequeno', label: 'Caminhão Pequeno' },
    { value: 'caminhao_medio', label: 'Caminhão Médio' },
    { value: 'caminhao_grande', label: 'Caminhão Grande' },
    { value: 'van', label: 'Van' },
    { value: 'pickup', label: 'Pickup' },
    { value: 'refrigerado', label: 'Veículo Refrigerado' },
    { value: 'outro', label: 'Outro' },
  ];

  const weightUnitOptions = [
    { value: 'kg', label: 'Quilograma (kg)' },
    { value: 'ton', label: 'Tonelada (ton)' },
  ];

  const volumeUnitOptions = [
    { value: 'm3', label: 'Metro Cúbico (m³)' },
    { value: 'l', label: 'Litro (l)' },
  ];

  const destinationTypeOptions = [
    { value: 'Local', label: 'Local (mesma cidade)' },
    { value: 'Regional', label: 'Regional (mesma província)' },
    { value: 'National', label: 'Nacional (todo o país)' },
  ];

  const statusOptions = [
    { value: 'Available', label: 'Disponível' },
    { value: 'OnTrip', label: 'Em Viagem' },
    { value: 'Unavailable', label: 'Indisponível' },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {isEditing ? 'Editar Serviço de Transporte' : 'Adicionar Novo Serviço de Transporte'}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Preencha os detalhes do seu serviço de transporte
          </p>
        </div>

        {(error || formError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error || formError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="serviceTitle"
            name="serviceTitle"
            label="Título do Serviço"
            type="text"
            placeholder="Ex: Transporte de Produtos Agrícolas"
            value={formData.serviceTitle}
            onChange={handleChange}
            required
          />

          <Select
            id="vehicleType"
            name="vehicleType"
            label="Tipo de Veículo"
            options={vehicleTypeOptions}
            value={formData.vehicleType}
            onChange={handleChange}
            required
          />

          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                id="carryingCapacityWeight"
                name="carryingCapacityWeight"
                label="Capacidade de Carga (Peso)"
                type="number"
                placeholder="Ex: 5000"
                value={formData.carryingCapacityWeight}
                onChange={handleNumberChange}
              />
            </div>
            <div className="flex-1">
              <Select
                id="capacityWeightUnit"
                name="capacityWeightUnit"
                label="Unidade de Peso"
                options={weightUnitOptions}
                value={formData.capacityWeightUnit}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                id="carryingCapacityVolume"
                name="carryingCapacityVolume"
                label="Capacidade de Carga (Volume)"
                type="number"
                placeholder="Ex: 20"
                value={formData.carryingCapacityVolume}
                onChange={handleNumberChange}
              />
            </div>
            <div className="flex-1">
              <Select
                id="capacityVolumeUnit"
                name="capacityVolumeUnit"
                label="Unidade de Volume"
                options={volumeUnitOptions}
                value={formData.capacityVolumeUnit}
                onChange={handleChange}
              />
            </div>
          </div>

          <Input
            id="pricingModel"
            name="pricingModel"
            label="Modelo de Preços"
            type="text"
            placeholder="Ex: 5000 AOA por km ou 20000 AOA por tonelada"
            value={formData.pricingModel}
            onChange={handleChange}
            required
          />

          <Select
            id="primaryDestinationType"
            name="primaryDestinationType"
            label="Tipo de Destino Principal"
            options={destinationTypeOptions}
            value={formData.primaryDestinationType}
            onChange={handleChange}
          />

          <Input
            id="baseLocationCity"
            name="baseLocationCity"
            label="Cidade Base"
            type="text"
            placeholder="Ex: Luanda"
            value={formData.baseLocationCity}
            onChange={handleChange}
            required
          />

          <Input
            id="baseLocationCountry"
            name="baseLocationCountry"
            label="País Base"
            type="text"
            value={formData.baseLocationCountry}
            onChange={handleChange}
            disabled
          />

          <Input
            id="operationalRoutes"
            name="operationalRoutes"
            label="Rotas Operacionais"
            type="text"
            placeholder="Ex: Luanda-Benguela, Luanda-Huambo"
            value={formData.operationalRoutes}
            onChange={handleChange}
          />

          <Select
            id="availabilityStatus"
            name="availabilityStatus"
            label="Status de Disponibilidade"
            options={statusOptions}
            value={formData.availabilityStatus}
            onChange={handleChange}
            required
          />

          <Input
            id="insuranceDetails"
            name="insuranceDetails"
            label="Detalhes do Seguro"
            type="text"
            placeholder="Ex: Seguro de carga completo até 5.000.000 AOA"
            value={formData.insuranceDetails}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagens do Veículo
          </label>
          <div className="flex space-x-2">
            <Input
              id="imageUrl"
              name="imageUrl"
              placeholder="URL da imagem"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mb-0"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addImage}
            >
              Adicionar
            </Button>
          </div>
          {formData.imagesUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.imagesUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Veículo ${index + 1}`}
                    className="h-32 w-full object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Imagem+Inválida';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Descreva seu serviço de transporte em detalhes..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Serviço' : 'Adicionar Serviço'}
        </Button>
      </form>
    </Card>
  );
};

export default TransportForm;
