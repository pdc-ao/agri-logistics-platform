import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Conectando Produtores e Consumidores em Angola
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            A maior plataforma digital agrícola de Angola. Conecte-se diretamente com produtores, 
            encontre soluções de armazenamento e transporte, tudo em um lugar.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Começar Agora
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                Ver Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Como Funciona Nossa Plataforma
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simplificamos o processo de compra e venda de produtos agrícolas, 
              conectando todos os participantes da cadeia de valor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Produtores</h3>
              <p className="text-gray-600 text-sm">
                Venda seus produtos diretamente aos consumidores com melhor preço
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Consumidores</h3>
              <p className="text-gray-600 text-sm">
                Compre produtos frescos diretamente dos produtores locais
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏭</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Armazenamento</h3>
              <p className="text-gray-600 text-sm">
                Encontre ou ofereça soluções de armazenamento adequadas
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Transporte</h3>
              <p className="text-gray-600 text-sm">
                Serviços de transporte confiáveis para suas mercadorias
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">1000+</div>
              <div className="text-gray-600">Produtores Cadastrados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
              <div className="text-gray-600">Produtos Disponíveis</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">18</div>
              <div className="text-gray-600">Províncias Cobertas</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Revolucionar seu Negócio Agrícola?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se à comunidade que está transformando a agricultura em Angola
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Cadastre-se Gratuitamente
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}