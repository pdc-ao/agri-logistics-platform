'use client';

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin - Moderação</h1>
      <div className="p-4 border rounded bg-white">
        <p className="text-sm text-gray-600">
          Placeholder para fila de moderação: avaliações suspeitas, disputas de pagamento, mensagens denunciadas.
        </p>
      </div>
      <div className="p-4 border rounded bg-gray-50 text-xs text-gray-500">
        Implementar: /api/admin/moderation (listar); /api/admin/moderation/:id (resolver).
      </div>
    </div>
  );
}