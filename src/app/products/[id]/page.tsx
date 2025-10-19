'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProductDetail {
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
  qualityCertifications?: string;
  imagesUrls?: string[];
  videoUrl?: string;
  status: string;
  createdAt: string;
  producer: {
    id: string;
    username: string;
    fullName?: string;
    averageRating?: number;
    city?: string;
    verificationStatus: string;
  };
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    reviewDate: string;
    reviewer: {
      username: string;
      fullName?: string;
    };
  }>;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Produto não encontrado</h2>
          <p className="text-gray-600 mb-6">O produto que você procura não existe ou foi removido.</p>
          <Link href="/products">
            <Button className="bg-green-600 hover:bg-green-700">
              ← Voltar aos Produtos
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const images = product.imagesUrls && product.imagesUrls.length > 0 
    ? product.imagesUrls 
    : ['/placeholder-product.jpg'];

  const totalPrice = product.pricePerUnit * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-green-600">Início</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-green-600">Produtos</Link>
          <span>›</span>
          <span className="text-gray-800">{product.category}</span>
          <span>›</span>
          <span className="text-gray-800 font-medium">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-green-50 to-blue-50 relative">
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {product.status === 'Active' && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Disponível
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-green-600 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-green-400'
                    }`}
                  >
                    <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Video */}
            {product.videoUrl && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">📹 Vídeo do Produto</h3>
                <video controls className="w-full rounded-lg">
                  <source src={product.videoUrl} type="video/mp4" />
                </video>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {product.category}
                </span>
                {product.subcategory && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {product.subcategory}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{product.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price & Availability */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Preço por {product.unitOfMeasure}</div>
                    <div className="text-5xl font-bold text-green-600">
                      {product.pricePerUnit.toLocaleString()} 
                      <span className="text-2xl ml-2">{product.currency}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Disponível</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {product.quantityAvailable} {product.unitOfMeasure}
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade ({product.unitOfMeasure})
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      variant="outline"
                      className="w-12 h-12 text-xl"
                    >
                      −
                    </Button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 h-12 text-center border-2 border-gray-300 rounded-lg text-xl font-semibold focus:border-green-500 focus:outline-none"
                      min="1"
                      max={product.quantityAvailable}
                    />
                    <Button
                      onClick={() => setQuantity(Math.min(product.quantityAvailable, quantity + 1))}
                      variant="outline"
                      className="w-12 h-12 text-xl"
                    >
                      +
                    </Button>
                    <div className="flex-1 text-right">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-2xl font-bold text-green-600">
                        {totalPrice.toLocaleString()} {product.currency}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button className="h-14 bg-green-600 hover:bg-green-700 text-lg font-semibold">
                    🛒 Comprar Agora
                  </Button>
                  <Button variant="outline" className="h-14 text-lg font-semibold hover:bg-green-50">
                    💬 Contactar Produtor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Producer Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">👨‍🌾 Sobre o Produtor</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(product.producer.fullName || product.producer.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{product.producer.fullName || product.producer.username}</div>
                    <div className="text-sm text-gray-600">@{product.producer.username}</div>
                    {product.producer.averageRating && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500 text-lg">★</span>
                        <span className="font-semibold">{product.producer.averageRating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">(baseado em avaliações)</span>
                      </div>
                    )}
                  </div>
                  {product.producer.verificationStatus === 'VERIFIED' && (
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      ✓ Verificado
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/profile/${product.producer.id}`}>
                    <Button variant="outline" className="w-full">
                      Ver Perfil
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    💬 Enviar Mensagem
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">ℹ️ Informações Adicionais</h3>
                
                {product.locationAddress && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <div className="font-medium text-gray-800">Localização</div>
                      <div className="text-gray-600">{product.locationAddress}</div>
                    </div>
                  </div>
                )}

                {product.qualityCertifications && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <div className="font-medium text-gray-800">Certificações</div>
                      <div className="text-gray-600">{product.qualityCertifications}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="font-medium text-gray-800">Publicado em</div>
                    <div className="text-gray-600">
                      {new Date(product.createdAt).toLocaleDateString('pt-AO', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">⭐ Avaliações</h2>
                <Button onClick={() => setShowReviewForm(true)} className="bg-green-600 hover:bg-green-700">
                  ✍️ Escrever Avaliação
                </Button>
              </div>

              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {(review.reviewer.fullName || review.reviewer.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{review.reviewer.fullName || review.reviewer.username}</div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.reviewDate).toLocaleDateString()}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 ml-13">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-3">💬</div>
                  <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Similar Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Produtos Similares</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Placeholder for similar products */}
            <Card className="p-4 text-center text-gray-400">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-sm">Carregando produtos similares...</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}