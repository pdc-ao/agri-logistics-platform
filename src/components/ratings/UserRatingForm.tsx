'use client';
import React, { useState } from 'react';
import { RatingStars } from './RatingStars';

interface Props {
  reviewerId: string;
  reviewedUserId: string;
  onSubmitted?: () => void;
}

export default function UserRatingForm({ reviewerId, reviewedUserId, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!rating) return;
    setBusy(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          reviewerId,
          reviewedEntityId: reviewedUserId,
          reviewedEntityType: 'User',
          rating,
          comment,
        }),
      });
      if (res.ok) {
        setRating(0);
        setComment('');
        onSubmitted?.();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 border rounded p-4 bg-white">
      <h3 className="font-semibold text-gray-800 text-sm">Avaliar Usuário</h3>
      <RatingStars value={rating} onChange={setRating} />
      <textarea
        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        rows={3}
        placeholder="Comentário (opcional)"
        value={comment}
        onChange={e=>setComment(e.target.value)}
      />
      <button
        onClick={submit}
        disabled={!rating || busy}
        className="px-4 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-50"
      >
        {busy ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </div>
  );
}