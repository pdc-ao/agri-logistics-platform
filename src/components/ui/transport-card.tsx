import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TransportCardProps {
  transport: {
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
    imagesUrls?: string[];
    transporter?: {
      id: string;
      username: string;
      fullName?: string;
      averageRating?: number;
    };
  };
  onViewDetails?: (id: string) => void;
  onContact?: (id: string) => void;
}

export const TransportCard: React.FC<TransportCardProps> = ({
  transport,
  onViewDetails,
  onContact,
}) => {
  const imageUrl = transport.imagesUrls && transport.imagesUrls.length > 0
    ? transport.imagesUrls[0]
    : 'https://via.placeholder.com/300x200?text=Sem+Imagem';

  const getStatusBadgeClass = () => {
    switch (transport.availabilityStatus) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'OnTrip':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = () => {
    switch (transport.availabilityStatus) {
      case 'Available':
        return 'Disponível';
      case 'OnTrip':
        return 'Em Viagem';
      case 'Unavailable':
        return 'Indisponível';
      default:
        return transport.availabilityStatus;
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={transport.serviceTitle}
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
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{transport.serviceTitle}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {transport.vehicleType}
          </span>
        </div>
        
        {transport.transporter && (
          <div className="text-sm text-gray-600 mb-2">
            Transportador: {transport.transporter.fullName || transport.transporter.username}
            {transport.transporter.averageRating && (
              <span className="ml-2 flex items-center">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1">{transport.transporter.averageRating.toFixed(1)}</span>
              </span>
            )}
          </div>
        )}
        
        {transport.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{transport.description}</p>
        )}
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-lg font-bold text-blue-700">
              {transport.pricingModel}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Base: {transport.baseLocationCity}
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-3">
          {transport.carryingCapacityWeight && transport.capacityWeightUnit && (
            <div>
              Capacidade: {transport.carryingCapacityWeight} {transport.capacityWeightUnit}
            </div>
          )}
          
          {transport.operationalRoutes && (
            <div>
              Rotas: {transport.operationalRoutes}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => onViewDetails && onViewDetails(transport.id)}
            className="flex-1"
          >
            Detalhes
          </Button>
          {transport.availabilityStatus === 'Available' && onContact && (
            <Button
              variant="default"
              onClick={() => onContact(transport.id)}
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

export default TransportCard;
