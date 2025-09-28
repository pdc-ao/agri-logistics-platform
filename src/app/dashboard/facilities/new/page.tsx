'use client';

import { useState } from 'react';

export default function NewFacilityPage() {
  const [form, setForm] = useState({
    facilityName: '',
    facilityType: '',
    capacity: '',
    capacityUnit: 'kg',
    addressLine1: '',
    city: '',
    country: 'Angola',
    description: '',
  });
  const [busy, setBusy] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }

  async function submit() {
    setBusy(true);
    try {
      // Placeholder; POST to /api/facilities (not implemented yet)
      console.log('Submitting facility', form);
      alert('API de criação não implementada.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Nova Instalação</h1>
      <div className="space-y-4 bg-white p-6 border rounded">
        <div className="grid gap-4">
          <label className="text-sm">
            <span className="block font-medium mb-1">Nome</span>
            <input
              name="facilityName"
              value={form.facilityName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="text-sm">
            <span className="block font-medium mb-1">Tipo</span>
            <input
              name="facilityType"
              value={form.facilityType}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <label className="text-sm flex-1">
              <span className="block font-medium mb-1">Capacidade</span>
              <input
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm w-32">
              <span className="block font-medium mb-1">Unidade</span>
              <select
                name="capacityUnit"
                value={form.capacityUnit}
                onChange={handleChange}
                className="w-full border rounded px-2 py-2 text-sm"
              >
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="m3">m³</option>
              </select>
            </label>
          </div>
          <label className="text-sm">
            <span className="block font-medium mb-1">Endereço</span>
            <input
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <label className="text-sm flex-1">
              <span className="block font-medium mb-1">Cidade</span>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm flex-1">
              <span className="block font-medium mb-1">País</span>
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="text-sm">
            <span className="block font-medium mb-1">Descrição</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded px-3 py-2 text-sm resize-none"
            />
          </label>
        </div>
        <button
          onClick={submit}
          disabled={busy}
          className="px-4 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-50"
        >
          {busy ? 'Salvando...' : 'Salvar'}
        </button>
        <p className="text-xs text-gray-400">
          (Endpoint /api/facilities não implementado.)
        </p>
      </div>
    </div>
  );
}