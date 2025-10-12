import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    quantityAvailable: number;
    unitOfMeasure: string;
    pricePerUnit: number;
    currency: string;
    imagesUrls?: string[];
    producer?: {
      id: string;
      username: string;
      fullName?: string;
      averageRating?: number;
    };
  };
  onViewDetails?: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
}) => {
  const imageUrl = product.imagesUrls && product.imagesUrls.length > 0
    ? product.imagesUrls[0]
    : 'https://via.placeholder.com/300x200?text=Sem+Imagem';

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Imagem+Indisponível';
          }}
        />
        {product.quantityAvailable <= 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Esgotado</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.title}</h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        {product.producer && (
          <div className="text-sm text-gray-600 mb-2">
            Produtor: {product.producer.fullName || product.producer.username}
            {product.producer.averageRating && (
              <span className="ml-2 flex items-center">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1">{product.producer.averageRating.toFixed(1)}</span>
              </span>
            )}
          </div>
        )}
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-lg font-bold text-green-700">
              {product.pricePerUnit.toLocaleString('pt-AO')} {product.currency}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              / {product.unitOfMeasure}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {product.quantityAvailable > 0 ? (
              <span>Disponível: {product.quantityAvailable} {product.unitOfMeasure}</span>
            ) : (
              <span className="text-red-600">Esgotado</span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => onViewDetails && onViewDetails(product.id)}
            className="flex-1"
          >
            Detalhes
          </Button>
          {product.quantityAvailable > 0 && onAddToCart && (
            <Button
              variant="default"
              onClick={() => onAddToCart(product.id)}
              className="flex-1"
            >
              Comprar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;