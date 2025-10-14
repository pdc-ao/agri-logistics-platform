// src/app/search/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SearchBar, AdvancedSearch, SearchResults } from '@/components/search/SearchBar';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const response = await fetch(`/api/search?${params.toString()}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Pesquisar
          </h1>
          <SearchBar />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-1/4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="lg:hidden w-full mb-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {showAdvanced ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            
            <div className={`${showAdvanced ? 'block' : 'hidden'} lg:block`}>
              <AdvancedSearch />
            </div>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {/* Results Summary */}
            {!loading && results && (
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg text-gray-700">
                  {results.total > 0 ? (
                    <>
                      <span className="font-semibold">{results.total}</span> resultado
                      {results.total !== 1 && 's'} encontrado
                      {results.total !== 1 && 's'}
                      {results.query && (
                        <> para <span className="font-semibold">"{results.query}"</span></>
                      )}
                    </>
                  ) : (
                    'Nenhum resultado encontrado'
                  )}
                </h2>
              </div>
            )}

            {/* Search Results */}
            <SearchResults results={results?.results} loading={loading} />

            {/* Pagination */}
            {!loading && results && results.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: results.pagination.totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <a
                        key={page}
                        href={`/search?${new URLSearchParams({
                          ...Object.fromEntries(searchParams.entries()),
                          page: page.toString(),
                        }).toString()}`}
                        className={`px-4 py-2 text-sm font-medium ${
                          page === results.pagination.page
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } border border-gray-300`}
                      >
                        {page}
                      </a>
                    )
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}