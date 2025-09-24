import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface StorageFormProps {
  onSubmit: (data: {
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
  }) => void;
  isLoading?: boolean;
  error?: string;
  initialData?: any;
  isEditing?: boolean;
}

export const StorageForm: React.FC<StorageFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = React.useState({
    facilityName: initialData?.facilityName || '',
    description: initialData?.description || '',
    storageType: initialData?.storageType || '',
    totalCapacity: initialData?.totalCapacity || '',
    capacityUnit: initialData?.capacityUnit || '',
    availableCapacity: initialData?.availableCapacity || '',
    amenities: initialData?.amenities || [],
    pricingStructure: initialData?.pricingStructure || '',
    responsibilities: initialData?.responsibilities || '',
    addressLine1: initialData?.addressLine1 || '',
    city: initialData?.city || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'Angola',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    imagesUrls: initialData?.imagesUrls || [],
    availabilityStatus: initialData?.availabilityStatus || 'Available',
  });
  
  const [formError, setFormError] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [amenity, setAmenity] = React.useState('');

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

  const addAmenity = () => {
    if (amenity && !formData.amenities.includes(amenity)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenity],
      }));
      setAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validação básica
    if (!formData.facilityName || !formData.description || !formData.storageType || 
        !formData.pricingStructure || !formData.addressLine1 || !formData.city || 
        !formData.postalCode || formData.latitude === '' || formData.longitude === '') {
      setFormError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    onSubmit({
      ...formData,
      totalCapacity: formData.totalCapacity ? Number(formData.totalCapacity) : undefined,
      availableCapacity: formData.availableCapacity ? Number(formData.availableCapacity) : undefined,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    });
  };

  const storageTypeOptions = [
    { value: 'refrigerado', label: 'Refrigerado' },
    { value: 'seco', label: 'Seco' },
    { value: 'temperatura_controlada', label: 'Temperatura Controlada' },
    { value: 'silo', label: 'Silo' },
    { value: 'armazem_geral', label: 'Armazém Geral' },
    { value: 'outro', label: 'Outro' },
  ];

  const capacityUnitOptions = [
    { value: 'm2', label: 'Metro Quadrado (m²)' },
    { value: 'm3', label: 'Metro Cúbico (m³)' },
    { value: 'ton', label: 'Tonelada (ton)' },
    { value: 'paletes', label: 'Paletes' },
  ];

  const statusOptions = [
    { value: 'Available', label: 'Disponível' },
    { value: 'PartiallyAvailable', label: 'Parcialmente Disponível' },
    { value: 'Full', label: 'Cheio' },
    { value: 'Unavailable', label: 'Indisponível' },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {isEditing ? 'Editar Instalação de Armazenamento' : 'Adicionar Nova Instalação de Armazenamento'}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Preencha os detalhes da sua instalação de armazenamento
          </p>
        </div>

        {(error || formError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error || formError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="facilityName"
            name="facilityName"
            label="Nome da Instalação"
            type="text"
            placeholder="Ex: Armazém Central Huambo"
            value={formData.facilityName}
            onChange={handleChange}
            required
          />

          <Select
            id="storageType"
            name="storageType"
            label="Tipo de Armazenamento"
            options={storageTypeOptions}
            value={formData.storageType}
            onChange={handleChange}
            required
          />

          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                id="totalCapacity"
                name="totalCapacity"
                label="Capacidade Total"
                type="number"
                placeholder="Ex: 1000"
                value={formData.totalCapacity}
                onChange={handleNumberChange}
              />
            </div>
            <div className="flex-1">
              <Select
                id="capacityUnit"
                name="capacityUnit"
                label="Unidade de Capacidade"
                options={capacityUnitOptions}
                value={formData.capacityUnit}
                onChange={handleChange}
              />
            </div>
          </div>

          <Input
            id="availableCapacity"
            name="availableCapacity"
            label="Capacidade Disponível"
            type="number"
            placeholder="Ex: 500"
            value={formData.availableCapacity}
            onChange={handleNumberChange}
          />

          <Input
            id="pricingStructure"
            name="pricingStructure"
            label="Estrutura de Preços"
            type="text"
            placeholder="Ex: 500 AOA por m² por mês"
            value={formData.pricingStructure}
            onChange={handleChange}
            required
          />

          <Input
            id="addressLine1"
            name="addressLine1"
            label="Endereço"
            type="text"
            placeholder="Ex: Rua Principal, 123"
            value={formData.addressLine1}
            onChange={handleChange}
            required
          />

          <Input
            id="city"
            name="city"
            label="Cidade"
            type="text"
            placeholder="Ex: Huambo"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <Input
            id="postalCode"
            name="postalCode"
            label="Código Postal"
            type="text"
            placeholder="Ex: 12345"
            value={formData.postalCode}
            onChange={handleChange}
            required
          />

          <Input
            id="country"
            name="country"
            label="País"
            type="text"
            value={formData.country}
            onChange={handleChange}
            disabled
          />

          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                id="latitude"
                name="latitude"
                label="Latitude"
                type="number"
                step="0.000001"
                placeholder="Ex: -12.345678"
                value={formData.latitude}
                onChange={handleNumberChange}
                required
              />
            </div>
            <div className="flex-1">
              <Input
                id="longitude"
                name="longitude"
                label="Longitude"
                type="number"
                step="0.000001"
                placeholder="Ex: 15.678901"
                value={formData.longitude}
                onChange={handleNumberChange}
                required
              />
            </div>
          </div>

          <Select
            id="availabilityStatus"
            name="availabilityStatus"
            label="Status de Disponibilidade"
            options={statusOptions}
            value={formData.availabilityStatus}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comodidades
          </label>
          <div className="flex space-x-2">
            <Input
              id="amenity"
              name="amenity"
              placeholder="Ex: Segurança 24h"
              type="text"
              value={amenity}
              onChange={(e) => setAmenity(e.target.value)}
              className="mb-0"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addAmenity}
            >
              Adicionar
            </Button>
          </div>
          {formData.amenities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.amenities.map((item, index) => (
                <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="ml-2 text-green-600 hover:text-green-800"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagens da Instalação
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
                    alt={`Instalação ${index + 1}`}
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
          <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 mb-1">
            Responsabilidades
          </label>
          <textarea
            id="responsibilities"
            name="responsibilities"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: Responsável por segurança, manutenção da temperatura, etc."
            value={formData.responsibilities}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Descreva sua instalação de armazenamento em detalhes..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Instalação' : 'Adicionar Instalação'}
        </Button>
      </form>
    </Card>
  );
};

export default StorageForm;
