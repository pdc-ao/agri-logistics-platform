import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
  const [formData, setFormData] = React.useState({
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
      imagesUrls: prev.imagesUrls.filter((_, i) => i !== index),
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
          <Input
            id="title"
            name="title"
            label="Título do Produto"
            type="text"
            placeholder="Ex: Milho Amarelo de Alta Qualidade"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <Select
            id="category"
            name="category"
            label="Categoria"
            options={categoryOptions}
            value={formData.category}
            onChange={handleChange}
            required
          />

          <Input
            id="subcategory"
            name="subcategory"
            label="Subcategoria (opcional)"
            type="text"
            placeholder="Ex: Milho Amarelo"
            value={formData.subcategory}
            onChange={handleChange}
          />

          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                id="quantityAvailable"
                name="quantityAvailable"
                label="Quantidade Disponível"
                type="number"
                placeholder="Ex: 1000"
                value={formData.quantityAvailable}
                onChange={handleNumberChange}
                required
              />
            </div>
            <div className="flex-1">
              <Select
                id="unitOfMeasure"
                name="unitOfMeasure"
                label="Unidade de Medida"
                options={unitOptions}
                value={formData.unitOfMeasure}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                id="pricePerUnit"
                name="pricePerUnit"
                label="Preço por Unidade"
                type="number"
                placeholder="Ex: 500"
                value={formData.pricePerUnit}
                onChange={handleNumberChange}
                required
              />
            </div>
            <div className="flex-1">
              <Input
                id="currency"
                name="currency"
                label="Moeda"
                type="text"
                value={formData.currency}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>

          <Input
            id="plannedAvailabilityDate"
            name="plannedAvailabilityDate"
            label="Data Planejada de Disponibilidade"
            type="date"
            value={formData.plannedAvailabilityDate}
            onChange={handleChange}
          />

          <Input
            id="actualAvailabilityDate"
            name="actualAvailabilityDate"
            label="Data Real de Disponibilidade"
            type="date"
            value={formData.actualAvailabilityDate}
            onChange={handleChange}
          />

          <Input
            id="locationAddress"
            name="locationAddress"
            label="Endereço de Localização"
            type="text"
            placeholder="Ex: Fazenda Boa Esperança, Huambo"
            value={formData.locationAddress}
            onChange={handleChange}
          />

          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                id="locationLatitude"
                name="locationLatitude"
                label="Latitude"
                type="number"
                step="0.000001"
                placeholder="Ex: -12.345678"
                value={formData.locationLatitude}
                onChange={handleNumberChange}
              />
            </div>
            <div className="flex-1">
              <Input
                id="locationLongitude"
                name="locationLongitude"
                label="Longitude"
                type="number"
                step="0.000001"
                placeholder="Ex: 15.678901"
                value={formData.locationLongitude}
                onChange={handleNumberChange}
              />
            </div>
          </div>

          <Select
            id="status"
            name="status"
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={handleChange}
            required
          />

          <Input
            id="qualityCertifications"
            name="qualityCertifications"
            label="Certificações de Qualidade"
            type="text"
            placeholder="Ex: Certificação Orgânica, ISO 22000"
            value={formData.qualityCertifications}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagens do Produto
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

        <Input
          id="videoUrl"
          name="videoUrl"
          label="URL do Vídeo (opcional)"
          type="text"
          placeholder="Ex: https://www.youtube.com/watch?v=..."
          value={formData.videoUrl}
          onChange={handleChange}
        />

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
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Adicionar Produto'}
        </Button>
      </form>
    </Card>
  );
};

export default ProductForm;

