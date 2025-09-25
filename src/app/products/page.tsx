'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  quantityAvailable: number;
  unitOfMeasure: string;
  pricePerUnit: number;
  currency: string;
  locationAddress?: string;
  status: string;
  producer: {
    id: string;
    username: string;
    fullName?: string;
    averageRating?: number;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = [
    'Cereais', 'Frutas', 'Vegetais', 'Legumes', 'Tubérculos', 
    'Especiarias', 'Oleaginosas', 'Bebidas', 'Outros'
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const url = selectedCategory 
        ? `/api/products?category=${encodeURIComponent(selectedCategory)}`
        : '/api/products';
      
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Produtos Disponíveis</h1>
        <p className="text-gray-600">Encontre os melhores produtos agrícolas diretamente dos produtores</p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('')}
            className="mb-2"
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌾</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600">
            {selectedCategory 
              ? `Não há produtos na categoria "${selectedCategory}" no momento.`
              : 'Não há produtos disponíveis no momento.'
            }
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {product.title}
                </CardTitle>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.producer.averageRating && (
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{product.producer.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Disponível:</span>
                    <span className="font-medium">
                      {product.quantityAvailable} {product.unitOfMeasure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preço:</span>
                    <span className="font-semibold text-green-600">
                      {product.pricePerUnit} {product.currency}/{product.unitOfMeasure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Produtor:</span>
                    <span className="font-medium">
                      {product.producer.fullName || product.producer.username}
                    </span>
                  </div>
                  {product.locationAddress && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Local:</span>
                      <span className="text-sm truncate">
                        {product.locationAddress}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <div className="flex gap-2 w-full">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Contactar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}