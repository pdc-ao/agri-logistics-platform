// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@agrilogistics.ao';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

/**
 * Email Templates
 */

export const emailTemplates = {
  /**
   * Welcome email for new users
   */
  welcome: (userName: string, userRole: string) => ({
    subject: 'Bem-vindo à Plataforma Agri-Logistics!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 Bem-vindo à Agri-Logistics!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${userName}</strong>,</p>
              <p>Estamos felizes em tê-lo conosco! Sua conta como <strong>${userRole}</strong> foi criada com sucesso.</p>
              
              <p><strong>Próximos passos:</strong></p>
              <ul>
                <li>Complete seu perfil</li>
                <li>Faça upload dos documentos necessários para verificação</li>
                <li>Comece a explorar a plataforma</li>
              </ul>
              
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Acessar Dashboard</a>
              
              <p>Se você tiver alguma dúvida, não hesite em nos contactar.</p>
              <p>Atenciosamente,<br>Equipe Agri-Logistics</p>
            </div>
            <div class="footer">
              <p>© 2024 Agri-Logistics Platform. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Olá ${userName}, bem-vindo à Agri-Logistics! Sua conta foi criada com sucesso.`,
  }),

  /**
   * Order confirmation email
   */
  orderConfirmation: (orderNumber: string, totalAmount: number, currency: string, buyerName: string) => ({
    subject: `Confirmação do Pedido #${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .order-details { background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Pedido Confirmado!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${buyerName}</strong>,</p>
              <p>Seu pedido foi confirmado com sucesso!</p>
              
              <div class="order-details">
                <h3>Detalhes do Pedido</h3>
                <p><strong>Número do Pedido:</strong> #${orderNumber}</p>
                <p><strong>Total:</strong> ${totalAmount.toLocaleString()} ${currency}</p>
                <p><strong>Status:</strong> Confirmado</p>
              </div>
              
              <a href="${process.env.NEXTAUTH_URL}/orders/${orderNumber}" class="button">Ver Pedido</a>
              
              <p>Você receberá atualizações sobre o status do seu pedido.</p>
              <p>Obrigado por usar nossa plataforma!</p>
            </div>
            <div class="footer">
              <p>© 2024 Agri-Logistics Platform</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Pedido #${orderNumber} confirmado. Total: ${totalAmount} ${currency}`,
  }),

  /**
   * Document verification status
   */
  documentVerification: (userName: string, documentType: string, status: 'APPROVED' | 'REJECTED', reason?: string) => ({
    subject: status === 'APPROVED' 
      ? `✅ Documento ${documentType} Aprovado` 
      : `❌ Documento ${documentType} Rejeitado`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${status === 'APPROVED' ? '#16a34a' : '#dc2626'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .reason-box { background-color: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${status === 'APPROVED' ? '✅ Documento Aprovado' : '❌ Documento Rejeitado'}</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${userName}</strong>,</p>
              <p>Seu documento <strong>${documentType}</strong> foi ${status === 'APPROVED' ? 'aprovado' : 'rejeitado'}.</p>
              
              ${status === 'REJECTED' && reason ? `
                <div class="reason-box">
                  <p><strong>Motivo da rejeição:</strong></p>
                  <p>${reason}</p>
                </div>
                <p>Por favor, faça o upload de um novo documento corrigindo os problemas mencionados.</p>
              ` : `
                <p>Obrigado por enviar a documentação necessária.</p>
              `}
              
              <a href="${process.env.NEXTAUTH_URL}/dashboard/verification" class="button">Ver Documentos</a>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Documento ${documentType} ${status === 'APPROVED' ? 'aprovado' : 'rejeitado'}`,
  }),

  /**
   * Production plan update notification
   */
  productionUpdate: (subscriberName: string, planTitle: string, updateTitle: string, updateDescription: string) => ({
    subject: `📢 Atualização: ${planTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .update-box { background-color: #eff6ff; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📢 Nova Atualização de Produção</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${subscriberName}</strong>,</p>
              <p>Há uma nova atualização sobre <strong>${planTitle}</strong>:</p>
              
              <div class="update-box">
                <h3>${updateTitle}</h3>
                <p>${updateDescription}</p>
              </div>
              
              <a href="${process.env.NEXTAUTH_URL}/dashboard/production/plans" class="button">Ver Plano Completo</a>
              
              <p>Continue acompanhando para mais atualizações!</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Nova atualização: ${updateTitle} - ${updateDescription}`,
  }),

  /**
   * Pre-order confirmation
   */
  preOrderConfirmation: (customerName: string, productName: string, quantity: number, estimatedDate: string) => ({
    subject: `✅ Pré-encomenda Confirmada: ${productName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .details { background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Pré-encomenda Confirmada!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${customerName}</strong>,</p>
              <p>Sua pré-encomenda foi confirmada com sucesso!</p>
              
              <div class="details">
                <h3>Detalhes da Pré-encomenda</h3>
                <p><strong>Produto:</strong> ${productName}</p>
                <p><strong>Quantidade:</strong> ${quantity}</p>
                <p><strong>Data Estimada de Colheita:</strong> ${estimatedDate}</p>
              </div>
              
              <p>Você receberá notificações sobre o progresso da produção e será avisado quando o produto estiver pronto para entrega.</p>
              
              <a href="${process.env.NEXTAUTH_URL}/dashboard/orders" class="button">Ver Minhas Pré-encomendas</a>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Pré-encomenda confirmada: ${productName} - ${quantity} unidades`,
  }),

  /**
   * Payment receipt
   */
  paymentReceipt: (userName: string, transactionId: string, amount: number, currency: string, description: string) => ({
    subject: `💰 Recibo de Pagamento - ${transactionId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .receipt { background-color: #faf5ff; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #7c3aed; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Recibo de Pagamento</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${userName}</strong>,</p>
              <p>Seu pagamento foi processado com sucesso!</p>
              
              <div class="receipt">
                <p><strong>ID da Transação:</strong> ${transactionId}</p>
                <p><strong>Descrição:</strong> ${description}</p>
                <div class="amount">${amount.toLocaleString()} ${currency}</div>
                <p style="text-align: center; color: #16a34a; font-weight: bold;">✓ Pagamento Confirmado</p>
              </div>
              
              <p>Guarde este email como comprovante de pagamento.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Pagamento confirmado: ${amount} ${currency} - ID: ${transactionId}`,
  }),

  /**
   * Password reset email
   */
  passwordReset: (userName: string, resetToken: string) => ({
    subject: '🔒 Redefinir Senha - Agri-Logistics',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Redefinir Senha</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${userName}</strong>,</p>
              <p>Você solicitou a redefinição de senha da sua conta.</p>
              
              <a href="${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}" class="button">Redefinir Senha</a>
              
              <div class="warning">
                <p><strong>⚠️ Atenção:</strong></p>
                <p>Este link é válido por 1 hora.</p>
                <p>Se você não solicitou esta redefinição, ignore este email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Redefinir senha: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`,
  }),
};

/**
 * Helper functions to send specific email types
 */

export async function sendWelcomeEmail(to: string, userName: string, userRole: string) {
  const template = emailTemplates.welcome(userName, userRole);
  return sendEmail({ to, ...template });
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  totalAmount: number,
  currency: string,
  buyerName: string
) {
  const template = emailTemplates.orderConfirmation(orderNumber, totalAmount, currency, buyerName);
  return sendEmail({ to, ...template });
}

export async function sendDocumentVerificationEmail(
  to: string,
  userName: string,
  documentType: string,
  status: 'APPROVED' | 'REJECTED',
  reason?: string
) {
  const template = emailTemplates.documentVerification(userName, documentType, status, reason);
  return sendEmail({ to, ...template });
}

export async function sendProductionUpdateEmail(
  to: string,
  subscriberName: string,
  planTitle: string,
  updateTitle: string,
  updateDescription: string
) {
  const template = emailTemplates.productionUpdate(subscriberName, planTitle, updateTitle, updateDescription);
  return sendEmail({ to, ...template });
}

export async function sendPreOrderConfirmationEmail(
  to: string,
  customerName: string,
  productName: string,
  quantity: number,
  estimatedDate: string
) {
  const template = emailTemplates.preOrderConfirmation(customerName, productName, quantity, estimatedDate);
  return sendEmail({ to, ...template });
}

export async function sendPaymentReceiptEmail(
  to: string,
  userName: string,
  transactionId: string,
  amount: number,
  currency: string,
  description: string
) {
  const template = emailTemplates.paymentReceipt(userName, transactionId, amount, currency, description);
  return sendEmail({ to, ...template });
}

export async function sendPasswordResetEmail(to: string, userName: string, resetToken: string) {
  const template = emailTemplates.passwordReset(userName, resetToken);
  return sendEmail({ to, ...template });
}