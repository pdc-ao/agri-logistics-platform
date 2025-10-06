// src/app/dashboard/transformation/page.tsx
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function TransformationFacilitiesPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    return <div className="p-8">Usuário não encontrado</div>;
  }

  const isTransformer = user.role === 'TRANSFORMER' || user.role === 'ADMIN';

  // Fetch facilities
  const facilities = await db.transformationFacility.findMany({
    where: isTransformer ? { ownerId: session.user.id } : {},
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          fullName: true,
          averageRating: true,
          city: true,
          phoneNumber: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
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

  const getFacilityTypeInfo = (type: string) => {
    return facilityTypes.find(ft => ft.value === type) || { icon: '🏭', label: type };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isTransformer ? 'Minhas Instalações de Transformação' : 'Instalações de Transformação'}
          </h1>
          <p className="text-gray-600">
            {isTransformer 
              ? 'Gerencie suas instalações de processamento'
              : 'Encontre serviços de transformação para seus produtos'
            }
          </p>
        </div>
        {isTransformer && (
          <Link href="/dashboard/transformation/new">
            <Button className="bg-green-600 hover:bg-green-700">
              + Nova Instalação
            </Button>
          </Link>
        )}
      </div>

      {/* Statistics Cards (only for transformers) */}
      {isTransformer && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{facilities.length}</div>
              <div className="text-sm text-gray-600">Total de Instalações</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {facilities.filter(f => f.facilityType === 'Processing').length}
              </div>
              <div className="text-sm text-gray-600">Processamento</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {facilities.filter(f => f.facilityType === 'Milling').length}
              </div>
              <div className="text-sm text-gray-600">Moagem</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {facilities.filter(f => f.facilityType === 'Packaging').length}
              </div>
              <div className="text-sm text-gray-600">Embalagem</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Facilities Grid */}
      {facilities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🏭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {isTransformer ? 'Nenhuma instalação cadastrada' : 'Nenhuma instalação encontrada'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isTransformer 
                ? 'Cadastre sua primeira instalação de transformação para começar a oferecer serviços.'
                : 'Não há instalações de transformação disponíveis no momento.'
              }
            </p>
            {isTransformer && (
              <Link href="/dashboard/transformation/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  Cadastrar Primeira Instalação
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <Card key={facility.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">
                      {getFacilityTypeInfo(facility.facilityType || '').icon}
                    </span>
                    <div>
                      <CardTitle className="text-lg line-clamp-1">
                        {facility.facilityName}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {getFacilityTypeInfo(facility.facilityType || '').label}
                      </p>
                    </div>
                  </div>
                  
                  {isTransformer && facility.ownerId === session.user.id && (
                    <div className="flex space-x-1">
                      <Link href={`/dashboard/transformation/${facility.id}/edit`}>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          ✏️
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {facility.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {facility.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  {facility.capacity && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Capacidade:</span>
                      <span className="font-medium">
                        {facility.capacity} {facility.capacityUnit}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Localização:</span>
                    <span className="font-medium">{facility.city}</span>
                  </div>
                  
                  {!isTransformer && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Proprietário:</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">
                          {facility.owner.fullName || facility.owner.username}
                        </span>
                        {facility.owner.averageRating && (
                          <div className="flex items-center">
                            <span className="text-yellow-500 text-xs">★</span>
                            <span className="text-xs">{facility.owner.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Criado em {new Date(facility.createdAt).toLocaleDateString('pt-AO')}
                  </div>
                </div>
                
                <div className="pt-3 flex space-x-2">
                  {!isTransformer ? (
                    <>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
                        Solicitar Orçamento
                      </Button>
                      <Button variant="outline" className="flex-1" size="sm">
                        Contactar
                      </Button>
                    </>
                  ) : (
                    <Link href={`/dashboard/transformation/${facility.id}`} className="w-full">
                      <Button variant="outline" className="w-full" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}