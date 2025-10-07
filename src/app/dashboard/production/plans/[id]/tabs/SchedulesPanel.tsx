'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { StatusBadge } from '@/components/ui/status-badge';

const scheduleSchema = z.object({
  milestoneName: z.string().min(2),
  milestoneType: z.enum([
    'LAND_PREPARATION','PLANTING','FERTILIZATION','IRRIGATION',
    'PEST_CONTROL','WEEDING','HARVEST_START','HARVEST_COMPLETE',
    'POST_HARVEST','CUSTOM'
  ]),
  scheduledDate: z.string(),
  notifyBefore: z.coerce.number().min(0).max(90)
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

export default function SchedulesPanel({ plan, isOwner }: { plan: any; isOwner: boolean }) {
  const [adding, setAdding] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ScheduleForm>({
    defaultValues: { milestoneType: 'CUSTOM', notifyBefore: 0 }
  });

  const onSubmit = async (data: ScheduleForm) => {
    const res = await fetch(`/api/production/plans/${plan.id}/schedules`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) location.reload();
    else alert('Failed to create schedule');
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-medium text-sm">Schedules</h2>
        {isOwner && (
          <button
            onClick={() => setAdding(a => !a)}
            className="text-sm px-3 py-1 rounded bg-green-600 text-white"
          >
            {adding ? 'Cancel' : 'Add Schedule'}
          </button>
        )}
      </div>
      {adding && isOwner && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 border p-4 rounded bg-neutral-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Milestone Name" error={errors.milestoneName?.message}>
              <input {...register('milestoneName')} className="field" />
            </Field>
            <Field label="Type" error={errors.milestoneType?.message}>
              <select {...register('milestoneType')} className="field">
                <option value="LAND_PREPARATION">Land Preparation</option>
                <option value="PLANTING">Planting</option>
                <option value="FERTILIZATION">Fertilization</option>
                <option value="IRRIGATION">Irrigation</option>
                <option value="PEST_CONTROL">Pest Control</option>
                <option value="WEEDING">Weeding</option>
                <option value="HARVEST_START">Harvest Start</option>
                <option value="HARVEST_COMPLETE">Harvest Complete</option>
                <option value="POST_HARVEST">Post Harvest</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </Field>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Scheduled Date" error={errors.scheduledDate?.message}>
                <input type="date" {...register('scheduledDate')} className="field" />
              </Field>
              <Field label="Notify Before (days)" error={errors.notifyBefore?.message}>
                <input type="number" {...register('notifyBefore')} className="field" />
              </Field>
              <div />
            </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded bg-green-600 text-white text-sm">
              Save
            </button>
            <button
              type="button"
              onClick={() => { reset(); setAdding(false); }}
              className="px-3 py-1.5 rounded bg-neutral-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <table className="w-full text-sm border">
        <thead className="bg-neutral-100">
          <tr>
            <th className="p-2 text-left">Milestone</th>
            <th className="p-2">Type</th>
            <th className="p-2">Scheduled</th>
            <th className="p-2">Status</th>
            <th className="p-2">Notify (d)</th>
            <th className="p-2">Completed</th>
          </tr>
        </thead>
        <tbody>
          {plan.schedules.map((s: any) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.milestoneName}</td>
              <td className="p-2 text-xs">{s.milestoneType}</td>
              <td className="p-2">{new Date(s.scheduledDate).toLocaleDateString()}</td>
              <td className="p-2">
                <StatusBadge status={s.status} kind="schedule" />
              </td>
              <td className="p-2 text-center">{s.notifyBefore}</td>
              <td className="p-2">
                {s.completedDate ? new Date(s.completedDate).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
          {plan.schedules.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-neutral-500">
                No schedules yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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