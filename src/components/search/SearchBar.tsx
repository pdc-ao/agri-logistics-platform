// src/components/search/SearchBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  type?: 'all' | 'products' | 'storage' | 'transport';
  className?: string;
}

export function SearchBar({
  placeholder = 'Pesquisar produtos, armazéns, transportes...',
  type = 'all',
  className = '',
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <svg
          className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <button
        type="submit"
        className="absolute right-2 top-2 px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}

// Advanced Search Component
export function AdvancedSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    type: searchParams.get('type') || 'all',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  const handleChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      type: 'all',
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pesquisa Avançada</h3>
      
      {/* Search Query */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          O que você está procurando?
        </label>
        <input
          type="text"
          value={filters.query}
          onChange={(e) => handleChange('query', e.target.value)}
          placeholder="Digite sua pesquisa..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo
        </label>
        <select
          value={filters.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Todos</option>
          <option value="products">Produtos</option>
          <option value="storage">Armazenamento</option>
          <option value="transport">Transporte</option>
        </select>
      </div>

      {/* Category Filter (for products) */}
      {filters.type === 'products' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todas as categorias</option>
            <option value="cereais">Cereais</option>
            <option value="frutas">Frutas</option>
            <option value="vegetais">Vegetais</option>
            <option value="legumes">Legumes</option>
            <option value="carnes">Carnes</option>
            <option value="laticinios">Laticínios</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      )}

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Localização
        </label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Cidade ou província..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Price Range (for products) */}
      {filters.type === 'products' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço Mín (AOA)
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço Máx (AOA)
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              placeholder="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="createdAt">Data</option>
            <option value="pricePerUnit">Preço</option>
            <option value="title">Nome</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordem
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="desc">Decrescente</option>
            <option value="asc">Crescente</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={handleSearch}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Aplicar Filtros
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}

// Search Results Component
interface SearchResultsProps {
  results: any;
  loading?: boolean;
}

export function SearchResults({ results, loading = false }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!results || results.total === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Nenhum resultado encontrado
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Tente ajustar seus filtros ou pesquisa
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Products */}
      {results.products && results.products.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Produtos ({results.products.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Storage Facilities */}
      {results.storage && results.storage.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Armazenamento ({results.storage.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.storage.map((facility: any) => (
              <StorageCard key={facility.id} facility={facility} />
            ))}
          </div>
        </div>
      )}

      {/* Transport Services */}
      {results.transport && results.transport.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Transporte ({results.transport.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.transport.map((service: any) => (
              <TransportCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {product.imagesUrls && product.imagesUrls.length > 0 ? (
        <img
          src={product.imagesUrls[0]}
          alt={product.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">Sem imagem</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">
            {product.pricePerUnit} {product.currency}/{product.unitOfMeasure}
          </span>
          <span className="text-sm text-gray-500">
            {product.quantityAvailable} disponível
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {product.producer.fullName || product.producer.username}
          </span>
          <a
            href={`/products/${product.id}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Ver detalhes →
          </a>
        </div>
      </div>
    </div>
  );
}

// Storage Card Component
function StorageCard({ facility }: { facility: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {facility.facilityName}
      </h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {facility.description}
      </p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {facility.city}
        </div>
        <div className="flex items-center text-gray-600">
          <span className="font-medium">Tipo:</span>
          <span className="ml-2">{facility.storageType}</span>
        </div>
      </div>
      <a
        href={`/storage/${facility.id}`}
        className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800"
      >
        Ver detalhes →
      </a>
    </div>
  );
}

// Transport Card Component
function TransportCard({ service }: { service: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {service.serviceTitle}
      </h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {service.description}
      </p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {service.vehicleType}
        </div>
        <div className="flex items-center text-gray-600">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {service.baseLocationCity}
        </div>
      </div>
      <a
        href={`/transport/${service.id}`}
        className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800"
      >
        Ver detalhes →
      </a>
    </div>
  );
}