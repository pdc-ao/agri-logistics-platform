'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const planSchema = z.object({
  productName: z.string().min(2),
  productCategory: z.string().min(2),
  variety: z.string().optional(),
  areaSize: z.coerce.number().positive(),
  areaUnit: z.string().default('HECTARES'),
  location: z.string().min(2),
  coordinates: z.string().optional(),
  estimatedQuantity: z.coerce.number().positive(),
  quantityUnit: z.string().min(1),
  plantingDate: z.string(),
  estimatedHarvestDate: z.string(),
  isPublic: z.boolean().default(true),
  allowPreOrders: z.boolean().default(false),
  description: z.string().optional(),
  farmingMethod: z.string().optional(),
  certifications: z.string().optional(),
  images: z.string().optional()
});

type PlanForm = z.infer<typeof planSchema>;

export default function NewProductionPlanPage() {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<PlanForm>({
    defaultValues: {
      areaUnit: 'HECTARES',
      quantityUnit: 'TONNES',
      isPublic: true,
      allowPreOrders: false
    }
  });

  const onSubmit = async (raw: PlanForm) => {
    setSubmitting(true);
    try {
      const payload = {
        ...raw,
        certifications: raw.certifications
          ? raw.certifications.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        images: raw.images
          ? raw.images.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };
      const res = await fetch('/api/production/plans', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert('Failed: ' + (data.error ? JSON.stringify(data.error) : res.status));
      } else {
        const plan = await res.json();
        window.location.href = `/dashboard/production/plans/${plan.id}`;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">New Production Plan</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Section title="Basics">
          <Grid cols={2}>
            <Field label="Product Name" error={errors.productName?.message}>
              <input {...register('productName')} className="field" />
            </Field>
            <Field label="Category" error={errors.productCategory?.message}>
              <input {...register('productCategory')} className="field" />
            </Field>
          </Grid>
          <Grid cols={2}>
            <Field label="Variety">
              <input {...register('variety')} className="field" />
            </Field>
            <Field label="Farming Method">
              <input {...register('farmingMethod')} className="field" />
            </Field>
          </Grid>
        </Section>

        <Section title="Area & Yield">
          <Grid cols={4}>
            <Field label="Area Size" error={errors.areaSize?.message}>
              <input type="number" step="0.01" {...register('areaSize')} className="field" />
            </Field>
            <Field label="Area Unit">
              <select {...register('areaUnit')} className="field">
                <option value="HECTARES">HECTARES</option>
                <option value="ACRES">ACRES</option>
              </select>
            </Field>
            <Field label="Est. Quantity" error={errors.estimatedQuantity?.message}>
              <input type="number" step="0.01" {...register('estimatedQuantity')} className="field" />
            </Field>
            <Field label="Quantity Unit" error={errors.quantityUnit?.message}>
              <input {...register('quantityUnit')} className="field" />
            </Field>
          </Grid>
        </Section>

        <Section title="Location & Dates">
          <Grid cols={3}>
            <Field label="Location" error={errors.location?.message}>
              <input {...register('location')} className="field" />
            </Field>
            <Field label="Coordinates">
              <input {...register('coordinates')} placeholder="lat,long" className="field" />
            </Field>
            <Field label="Planting Date" error={errors.plantingDate?.message}>
              <input type="date" {...register('plantingDate')} className="field" />
            </Field>
          </Grid>
          <Grid cols={3}>
            <div />
            <Field label="Estimated Harvest Date" error={errors.estimatedHarvestDate?.message}>
              <input type="date" {...register('estimatedHarvestDate')} className="field" />
            </Field>
            <div />
          </Grid>
        </Section>

        <Section title="Options">
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isPublic')} /> Public
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('allowPreOrders')} /> Allow Pre-Orders
            </label>
          </div>
        </Section>

        <Section title="Meta">
          <Field label="Certifications (comma separated)">
            <input {...register('certifications')} className="field" />
          </Field>
          <Field label="Images (comma separated URLs)">
            <input {...register('images')} className="field" />
          </Field>
          <Field label="Description">
            <textarea rows={4} {...register('description')} className="field" />
          </Field>
        </Section>

        <div className="flex gap-4">
          <button
            disabled={submitting}
            className="px-5 py-2 rounded bg-green-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Plan'}
          </button>
          <a
            href="/dashboard/production/plans"
            className="px-5 py-2 rounded bg-neutral-200 text-sm"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border p-4 space-y-3 bg-white">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return <div className={`grid gap-4 md:grid-cols-${cols}`}>{children}</div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm space-y-1">
      <span className="font-medium">{label}</span>
      {children}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
}