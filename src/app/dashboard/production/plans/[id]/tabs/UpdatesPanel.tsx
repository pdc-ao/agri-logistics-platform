'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { StatusBadge } from '@/components/ui/status-badge';

const updateSchema = z.object({
  updateType: z.enum([
    'PROGRESS_UPDATE','MILESTONE_REACHED','ISSUE_REPORTED','QUANTITY_CHANGE',
    'DATE_CHANGE','WEATHER_IMPACT','PEST_DISEASE','GENERAL'
  ]),
  title: z.string().min(3),
  description: z.string().min(5),
  images: z.string().optional(),
  currentGrowthStage: z.string().optional(),
  healthStatus: z.string().optional(),
  quantityAdjustment: z.coerce.number().optional(),
  dateAdjustment: z.string().optional()
});

type UpdateForm = z.infer<typeof updateSchema>;

export default function UpdatesPanel({ plan, isOwner }: { plan: any; isOwner: boolean }) {
  const [adding, setAdding] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateForm>({
    defaultValues: { updateType: 'PROGRESS_UPDATE' }
  });

  const submit = async (data: UpdateForm) => {
    const payload = {
      ...data,
      images: data.images
        ? data.images.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };
    const res = await fetch(`/api/production/plans/${plan.id}/updates`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) window.location.reload();
    else alert('Failed to add update');
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-medium text-sm">Updates</h2>
        {isOwner && (
          <button
            onClick={() => setAdding(a => !a)}
            className="text-sm px-3 py-1 rounded bg-green-600 text-white"
          >
            {adding ? 'Cancel' : 'Add Update'}
          </button>
        )}
      </div>

      {adding && isOwner && (
        <form
          onSubmit={handleSubmit(submit)}
          className="border rounded p-4 grid gap-3 bg-neutral-50"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Type" error={errors.updateType?.message}>
              <select {...register('updateType')} className="field">
                <option value="PROGRESS_UPDATE">Progress</option>
                <option value="MILESTONE_REACHED">Milestone</option>
                <option value="ISSUE_REPORTED">Issue</option>
                <option value="QUANTITY_CHANGE">Quantity Change</option>
                <option value="DATE_CHANGE">Date Change</option>
                <option value="WEATHER_IMPACT">Weather Impact</option>
                <option value="PEST_DISEASE">Pest/Disease</option>
                <option value="GENERAL">General</option>
              </select>
            </Field>
            <Field label="Title" error={errors.title?.message}>
              <input {...register('title')} className="field" />
            </Field>
          </div>
          <Field label="Description" error={errors.description?.message}>
            <textarea rows={4} {...register('description')} className="field" />
          </Field>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Growth Stage">
              <input {...register('currentGrowthStage')} className="field" />
            </Field>
            <Field label="Health Status">
              <input {...register('healthStatus')} className="field" />
            </Field>
            <Field label="Quantity Adjustment">
              <input type="number" step="0.01" {...register('quantityAdjustment')} className="field" />
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Date Adjustment">
              <input type="date" {...register('dateAdjustment')} className="field" />
            </Field>
            <Field label="Images (comma separated URLs)">
              <input {...register('images')} className="field" />
            </Field>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-green-600 text-white rounded text-sm">Save</button>
            <button
              type="button"
              onClick={() => {
                reset();
                setAdding(false);
              }}
              className="px-4 py-1.5 bg-neutral-200 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {plan.updates.map((u: any) => (
          <div key={u.id} className="border rounded p-4 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{u.title}</h3>
              <StatusBadge status={u.updateType} kind="generic" />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              By {u.user?.username || u.createdBy.slice(0, 8)} • {new Date(u.createdAt).toLocaleString()}
            </p>
            <p className="text-sm mt-2 whitespace-pre-line">{u.description}</p>
            {u.images?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {u.images.map((img: string) => (
                  <a
                    key={img}
                    href={img}
                    target="_blank"
                    className="text-xs underline text-green-700 break-all"
                  >
                    {img}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {plan.updates.length === 0 && (
          <div className="text-sm text-neutral-500">No updates yet.</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs space-y-1 font-medium">
      <span>{label}</span>
      {children}
      {error && <span className="text-rose-600">{error}</span>}
    </label>
  );
}