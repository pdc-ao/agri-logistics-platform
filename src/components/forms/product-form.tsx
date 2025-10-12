import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  quantityAvailable: string | number;
  unitOfMeasure: string;
  pricePerUnit: string | number;
  currency: string;
  plannedAvailabilityDate: string;
  actualAvailabilityDate: string;
  locationAddress: string;
  locationLatitude: string | number;
  locationLongitude: string | number;
  qualityCertifications: string;
  imagesUrls: string[];
  videoUrl: string;
  status: string;
}

interface ProductFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    quantityAvailable: number;
    unitOfMeasure: string;
    pricePerUnit: number;
    currency: string;
    plannedAvailabilityDate?: string;
    actualAvailabilityDate?: string;
    locationAddress?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    qualityCertifications?: string;
    imagesUrls?: string[];
    videoUrl?: string;
    status: string;
  }) => void;
  isLoading?: boolean;
  error?: string;
  initialData?: any;
  isEditing?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = React.useState<ProductFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    quantityAvailable: initialData?.quantityAvailable || '',
    unitOfMeasure: initialData?.unitOfMeasure || '',
    pricePerUnit: initialData?.pricePerUnit || '',
    currency: initialData?.currency || 'AOA',
    plannedAvailabilityDate: initialData?.plannedAvailabilityDate ? new Date(initialData.plannedAvailabilityDate).toISOString().split('T')[0] : '',
    actualAvailabilityDate: initialData?.actualAvailabilityDate ? new Date(initialData.actualAvailabilityDate).toISOString().split('T')[0] : '',
    locationAddress: initialData?.locationAddress || '',
    locationLatitude: initialData?.locationLatitude || '',
    locationLongitude: initialData?.locationLongitude || '',
    qualityCertifications: initialData?.qualityCertifications || '',
    imagesUrls: initialData?.imagesUrls || [],
    videoUrl: initialData?.videoUrl || '',
    status: initialData?.status || 'Active',
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
      imagesUrls: prev.imagesUrls.filter((_item: string, i: number) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validação básica
    if (!formData.title || !formData.description || !formData.category || 
        !formData.quantityAvailable || !formData.unitOfMeasure || !formData.pricePerUnit) {
      setFormError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    onSubmit({
      ...formData,
      quantityAvailable: Number(formData.quantityAvailable),
      pricePerUnit: Number(formData.pricePerUnit),
      locationLatitude: formData.locationLatitude ? Number(formData.locationLatitude) : undefined,
      locationLongitude: formData.locationLongitude ? Number(formData.locationLongitude) : undefined,
    });
  };

  const categoryOptions = [
    { value: 'cereais', label: 'Cereais' },
    { value: 'frutas', label: 'Frutas' },
    { value: 'vegetais', label: 'Vegetais' },
    { value: 'legumes', label: 'Legumes' },
    { value: 'carnes', label: 'Carnes' },
    { value: 'laticinios', label: 'Laticínios' },
    { value: 'outros', label: 'Outros' },
  ];

  const unitOptions = [
    { value: 'kg', label: 'Quilograma (kg)' },
    { value: 'ton', label: 'Tonelada (ton)' },
    { value: 'l', label: 'Litro (l)' },
    { value: 'unidade', label: 'Unidade' },
    { value: 'caixa', label: 'Caixa' },
    { value: 'saco', label: 'Saco' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Ativo' },
    { value: 'Inactive', label: 'Inativo' },
    { value: 'Draft', label: 'Rascunho' },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Preencha os detalhes do seu produto agrícola ou pecuário
          </p>
        </div>

        {(error || formError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error || formError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título do Produto <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Ex: Milho Amarelo de Alta Qualidade"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Selecione uma categoria</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
              Subcategoria (opcional)
            </label>
            <input
              id="subcategory"
              name="subcategory"
              type="text"
              placeholder="Ex: Milho Amarelo"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Quantity and Unit */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="quantityAvailable" className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade Disponível <span className="text-red-500">*</span>
              </label>
              <input
                id="quantityAvailable"
                name="quantityAvailable"
                type="number"
                placeholder="Ex: 1000"
                value={formData.quantityAvailable}
                onChange={handleNumberChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700 mb-1">
                Unidade de Medida <span className="text-red-500">*</span>
              </label>
              <select
                id="unitOfMeasure"
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Selecione</option>
                {unitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price and Currency */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-1">
                Preço por Unidade <span className="text-red-500">*</span>
              </label>
              <input
                id="pricePerUnit"
                name="pricePerUnit"
                type="number"
                placeholder="Ex: 500"
                value={formData.pricePerUnit}
                onChange={handleNumberChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Moeda
              </label>
              <input
                id="currency"
                name="currency"
                type="text"
                value={formData.currency}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Planned Availability Date */}
          <div>
            <label htmlFor="plannedAvailabilityDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Planejada de Disponibilidade
            </label>
            <input
              id="plannedAvailabilityDate"
              name="plannedAvailabilityDate"
              type="date"
              value={formData.plannedAvailabilityDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Actual Availability Date */}
          <div>
            <label htmlFor="actualAvailabilityDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Real de Disponibilidade
            </label>
            <input
              id="actualAvailabilityDate"
              name="actualAvailabilityDate"
              type="date"
              value={formData.actualAvailabilityDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Location Address */}
          <div>
            <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Endereço de Localização
            </label>
            <input
              id="locationAddress"
              name="locationAddress"
              type="text"
              placeholder="Ex: Fazenda Boa Esperança, Huambo"
              value={formData.locationAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Latitude and Longitude */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="locationLatitude" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                id="locationLatitude"
                name="locationLatitude"
                type="number"
                step="0.000001"
                placeholder="Ex: -12.345678"
                value={formData.locationLatitude}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="locationLongitude" className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                id="locationLongitude"
                name="locationLongitude"
                type="number"
                step="0.000001"
                placeholder="Ex: 15.678901"
                value={formData.locationLongitude}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quality Certifications */}
          <div>
            <label htmlFor="qualityCertifications" className="block text-sm font-medium text-gray-700 mb-1">
              Certificações de Qualidade
            </label>
            <input
              id="qualityCertifications"
              name="qualityCertifications"
              type="text"
              placeholder="Ex: Certificação Orgânica, ISO 22000"
              value={formData.qualityCertifications}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagens do Produto
          </label>
          <div className="flex space-x-2">
            <input
              id="imageUrl"
              name="imageUrl"
              placeholder="URL da imagem"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    alt={`Produto ${index + 1}`}
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

        {/* Video URL */}
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL do Vídeo (opcional)
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            type="text"
            placeholder="Ex: https://www.youtube.com/watch?v=..."
            value={formData.videoUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Descreva seu produto em detalhes..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          variant="default"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Adicionar Produto'}
        </Button>
      </form>
    </Card>
  );
};

export default ProductForm;