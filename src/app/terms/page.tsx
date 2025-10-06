// src/app/terms/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Termos e Condições de Uso
          </h1>
          <p className="text-gray-600">
            AgriConnect Angola - Plataforma de Logística Agrícola
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Última atualização: {new Date().toLocaleDateString('pt-AO', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Aceitação dos Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Ao acessar e utilizar a plataforma AgriConnect Angola ("Plataforma"), você concorda 
              em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não 
              concordar com qualquer parte destes termos, não deve utilizar nossa plataforma.
            </p>
            <p>
              A AgriConnect Angola é uma plataforma de marketplace que conecta produtores agrícolas, 
              consumidores, proprietários de armazéns, transportadores e transformadores em Angola.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Definições</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <div>
              <strong>Produtor:</strong> Usuário que lista produtos agrícolas para venda na plataforma.
            </div>
            <div>
              <strong>Consumidor:</strong> Usuário que compra produtos agrícolas através da plataforma.
            </div>
            <div>
              <strong>Proprietário de Armazém:</strong> Usuário que oferece serviços de armazenamento.
            </div>
            <div>
              <strong>Transportador:</strong> Usuário que oferece serviços de transporte de produtos.
            </div>
            <div>
              <strong>Transformador:</strong> Usuário que oferece serviços de processamento e transformação de produtos agrícolas.
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Cadastro e Conta de Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>3.1.</strong> Para utilizar os serviços da plataforma, você deve criar uma conta 
              fornecendo informações precisas, completas e atualizadas.
            </p>
            <p>
              <strong>3.2.</strong> Você é responsável por manter a confidencialidade de sua senha 
              e por todas as atividades que ocorram em sua conta.
            </p>
            <p>
              <strong>3.3.</strong> Você concorda em notificar imediatamente a AgriConnect Angola 
              sobre qualquer uso não autorizado de sua conta.
            </p>
            <p>
              <strong>3.4.</strong> A verificação de identidade pode ser necessária para certos 
              tipos de usuários, especialmente produtores, transportadores e proprietários de armazéns.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Uso da Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>4.1. Conduta do Usuário:</strong> Você concorda em usar a plataforma apenas 
              para fins legais e de acordo com estes termos.
            </p>
            <p>
              <strong>4.2. Proibições:</strong> É expressamente proibido:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Publicar informações falsas ou enganosas</li>
              <li>Violar direitos de propriedade intelectual</li>
              <li>Usar a plataforma para atividades fraudulentas</li>
              <li>Assediar, ameaçar ou prejudicar outros usuários</li>
              <li>Tentar contornar medidas de segurança da plataforma</li>
              <li>Usar bots ou scripts automatizados sem autorização</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Transações e Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>5.1. Sistema de Garantia (Escrow):</strong> A plataforma utiliza um sistema 
              de garantia para proteger compradores e vendedores. Os fundos são mantidos em garantia 
              até a confirmação da entrega.
            </p>
            <p>
              <strong>5.2. Carteira Digital:</strong> Usuários podem manter saldo em uma carteira 
              digital na plataforma para facilitar transações.
            </p>
            <p>
              <strong>5.3. Taxas:</strong> A AgriConnect Angola pode cobrar taxas de serviço sobre 
              transações realizadas através da plataforma. As taxas serão claramente comunicadas 
              antes da conclusão de qualquer transação.
            </p>
            <p>
              <strong>5.4. Disputas:</strong> Em caso de disputa sobre uma transação, os usuários 
              devem primeiro tentar resolver diretamente. Se não for possível, a AgriConnect Angola 
              pode mediar a disputa.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Listagens de Produtos e Serviços</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>6.1.</strong> Produtores são responsáveis por fornecer descrições precisas, 
              fotos atualizadas e informações corretas sobre seus produtos.
            </p>
            <p>
              <strong>6.2.</strong> Todos os produtos devem cumprir com as leis e regulamentos 
              angolanos aplicáveis.
            </p>
            <p>
              <strong>6.3.</strong> A AgriConnect Angola se reserva o direito de remover listagens 
              que violem estes termos ou que sejam consideradas inadequadas.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Verificação e Certificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>7.1.</strong> A plataforma oferece um sistema de verificação para aumentar 
              a confiança entre os usuários.
            </p>
            <p>
              <strong>7.2.</strong> Usuários verificados passaram por um processo de validação de 
              identidade e documentação.
            </p>
            <p>
              <strong>7.3.</strong> A verificação não garante a qualidade dos produtos ou serviços, 
              mas confirma a identidade do usuário.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Propriedade Intelectual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>8.1.</strong> Todo o conteúdo da plataforma, incluindo textos, gráficos, 
              logotipos, ícones e software, é propriedade da AgriConnect Angola ou de seus licenciadores.
            </p>
            <p>
              <strong>8.2.</strong> Você mantém todos os direitos sobre o conteúdo que publica na 
              plataforma, mas concede à AgriConnect Angola uma licença para usar, exibir e 
              distribuir esse conteúdo conforme necessário para operar a plataforma.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Privacidade e Proteção de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>9.1.</strong> O uso de suas informações pessoais é regido por nossa 
              Política de Privacidade, que está incorporada a estes termos por referência.
            </p>
            <p>
              <strong>9.2.</strong> Você concorda com a coleta, uso e compartilhamento de suas 
              informações conforme descrito em nossa Política de Privacidade.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. Limitação de Responsabilidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>10.1.</strong> A AgriConnect Angola atua como intermediária e não é responsável 
              pela qualidade, segurança ou legalidade dos produtos listados, pela capacidade dos 
              usuários de concluir transações, ou pela veracidade das listagens.
            </p>
            <p>
              <strong>10.2.</strong> A plataforma é fornecida "como está" sem garantias de qualquer tipo.
            </p>
            <p>
              <strong>10.3.</strong> Em nenhuma circunstância a AgriConnect Angola será responsável 
              por danos indiretos, incidentais, especiais ou consequenciais.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>11. Rescisão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>11.1.</strong> Você pode encerrar sua conta a qualquer momento entrando em 
              contato conosco.
            </p>
            <p>
              <strong>11.2.</strong> A AgriConnect Angola pode suspender ou encerrar sua conta se 
              você violar estes termos ou se envolver em atividades fraudulentas ou ilegais.
            </p>
            <p>
              <strong>11.3.</strong> Após o encerramento, certas disposições destes termos continuarão 
              em vigor, incluindo limitações de responsabilidade e resolução de disputas.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>12. Modificações dos Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>12.1.</strong> A AgriConnect Angola se reserva o direito de modificar estes 
              termos a qualquer momento.
            </p>
            <p>
              <strong>12.2.</strong> Mudanças significativas serão notificadas através da plataforma 
              ou por e-mail.
            </p>
            <p>
              <strong>12.3.</strong> O uso continuado da plataforma após modificações constitui 
              aceitação dos novos termos.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>13. Lei Aplicável e Jurisdição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>13.1.</strong> Estes termos são regidos pelas leis da República de Angola.
            </p>
            <p>
              <strong>13.2.</strong> Qualquer disputa decorrente destes termos será submetida à 
              jurisdição exclusiva dos tribunais de Luanda, Angola.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>14. Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Para questões sobre estes Termos e Condições, entre em contato conosco:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>AgriConnect Angola</strong></p>
              <p>Email: suporte@agriconnect.ao</p>
              <p>Telefone: +244 XXX XXX XXX</p>
              <p>Endereço: Luanda, Angola</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 pb-8">
          <Link href="/">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Voltar à Página Inicial
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}