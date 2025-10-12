export const dynamic = "force-dynamic";
import { PrismaClient, DocumentStatus } from '@prisma/client';
import { db } from "@/lib/prisma"; // better, see step 3

const prisma = new PrismaClient();

export default async function DocumentReviewQueue() {
  const pending = await prisma.document.findMany({
    where: { status: 'PENDING_REVIEW' },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { email: true, username: true, entityType: true } } }
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Document Review Queue</h1>
      <table className="w-full text-sm border">
        <thead className="bg-neutral-100">
          <tr>
            <th className="p-2 text-left">User</th>
            <th className="p-2">Entity Type</th>
            <th className="p-2">Type</th>
            <th className="p-2">Uploaded</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pending.map(doc => (
            <tr key={doc.id} className="border-t">
              <td className="p-2">{doc.user.username} <span className="text-neutral-500 text-xs">{doc.user.email}</span></td>
              <td className="p-2">{doc.user.entityType}</td>
              <td className="p-2">{doc.type}</td>
              <td className="p-2">{new Date(doc.createdAt).toLocaleString()}</td>
              <td className="p-2">
                <ReviewActions docId={doc.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Client component would handle approve/reject via fetch to /api/documents/:id/review
function ReviewActions({ docId }: { docId: string }) {
  return (
    <div className="flex gap-2">
      <form action={`/api/documents/${docId}/approve`} method="post">
        <button className="px-2 py-1 rounded bg-green-600 text-white text-xs">Approve</button>
      </form>
      <form action={`/api/documents/${docId}/reject`} method="post">
        <button className="px-2 py-1 rounded bg-rose-600 text-white text-xs">Reject</button>
      </form>
    </div>
  );
}