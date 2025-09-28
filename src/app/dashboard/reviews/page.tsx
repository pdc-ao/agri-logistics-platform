'use client';

import { useEffect, useState } from 'react';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  reviewDate: string;
  reviewedEntityType: string;
  reviewer: { username: string; fullName?: string };
}

export default function ReviewsPage() {
  const userId = 'replace-with-session-id';
  const [reviewsGiven, setReviewsGiven] = useState<Review[]>([]);
  const [reviewsReceived, setReviewsReceived] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const givenRes = await fetch(`/api/reviews?reviewerId=${userId}`);
        const givenData = await givenRes.json();
        setReviewsGiven(Array.isArray(givenData) ? givenData : []);

        const receivedRes = await fetch(`/api/reviews?reviewedEntityId=${userId}&reviewedEntityType=User`);
        const receivedData = await receivedRes.json();
        setReviewsReceived(Array.isArray(receivedData) ? receivedData : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Avaliações</h1>
      {loading ? (
        <div className="text-sm text-gray-500">Carregando...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-semibold mb-3">Avaliações que fiz</h2>
            <ul className="space-y-3">
              {reviewsGiven.length === 0 && (
                <li className="text-xs text-gray-500">Nenhuma avaliação</li>
              )}
              {reviewsGiven.map(r => (
                <li key={r.id} className="border rounded p-3 bg-white">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Nota:</span>
                    <span className="text-yellow-600">{'★'.repeat(r.rating)}</span>
                  </div>
                  {r.comment && (
                    <p className="mt-1 text-sm text-gray-700">{r.comment}</p>
                  )}
                  <div className="text-[10px] text-gray-400 mt-2">
                    {new Date(r.reviewDate).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-3">Avaliações que recebi</h2>
            <ul className="space-y-3">
              {reviewsReceived.length === 0 && (
                <li className="text-xs text-gray-500">Nenhuma avaliação</li>
              )}
              {reviewsReceived.map(r => (
                <li key={r.id} className="border rounded p-3 bg-white">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">De:</span>
                    <span>{r.reviewer.fullName || r.reviewer.username}</span>
                    <span className="ml-2 text-yellow-600">
                      {'★'.repeat(r.rating)}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-1 text-sm text-gray-700">{r.comment}</p>
                  )}
                  <div className="text-[10px] text-gray-400 mt-2">
                    {new Date(r.reviewDate).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <p className="text-xs text-gray-400">
        (UserRating model ainda não integrado — somente Review padrão.)
      </p>
    </div>
  );
}