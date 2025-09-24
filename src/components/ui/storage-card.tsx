import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StorageCardProps {
  storage: {
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
    imagesUrls?: string[];
    availabilityStatus: string;
    owner?: {
      id: string;
      username: string;
      fullName?: string;
      averageRating?: number;
    };
  };
  onViewDetails?: (id: string) => void;
  onContact?: (id: string) => void;
}

export const StorageCard: React.FC<StorageCardProps> = ({
  storage,
  onViewDetails,
  onContact,
}) => {
  const imageUrl = storage.imagesUrls && storage.imagesUrls.length > 0
    ? storage.imagesUrls[0]
    : 'https://via.placeholder.com/300x200?text=Sem+Imagem';

  const getStatusBadgeClass = () => {
    switch (storage.availabilityStatus) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'PartiallyAvailable':
        return 'bg-yellow-100 text-yellow-800';
      case 'Full':
        return 'bg-red-100 text-red-800';
      case 'Unavailable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = () => {
    switch (storage.availabilityStatus) {
      case 'Available':
        return 'Disponível';
      case 'PartiallyAvailable':
        return 'Parcialmente Disponível';
      case 'Full':
        return 'Cheio';
      case 'Unavailable':
        return 'Indisponível';
      default:
        return storage.availabilityStatus;
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={storage.facilityName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Imagem+Indisponível';
          }}
        />
        <div className={`absolute top-2 right-2 ${getStatusBadgeClass()} px-2 py-1 rounded-full text-xs font-medium`}>
          {getStatusText()}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{storage.facilityName}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {storage.storageType}
          </span>
        </div>
        
        {storage.owner && (
          <div className="text-sm text-gray-600 mb-2">
            Proprietário: {storage.owner.fullName || storage.owner.username}
            {storage.owner.averageRating && (
              <span className="ml-2 flex items-center">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1">{storage.owner.averageRating.toFixed(1)}</span>
              </span>
            )}
          </div>
        )}
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{storage.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-lg font-bold text-blue-700">
              {storage.pricingStructure}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {storage.city}
          </div>
        </div>
        
        {storage.totalCapacity && storage.capacityUnit && (
          <div className="text-sm text-gray-600 mb-3">
            Capacidade: {storage.totalCapacity} {storage.capacityUnit}
            {storage.availableCapacity !== undefined && (
              <span className="ml-2">
                (Disponível: {storage.availableCapacity} {storage.capacityUnit})
              </span>
            )}
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => onViewDetails && onViewDetails(storage.id)}
            className="flex-1"
          >
            Detalhes
          </Button>
          {(storage.availabilityStatus === 'Available' || storage.availabilityStatus === 'PartiallyAvailable') && onContact && (
            <Button
              variant="primary"
              onClick={() => onContact(storage.id)}
              className="flex-1"
            >
              Contactar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StorageCard;

