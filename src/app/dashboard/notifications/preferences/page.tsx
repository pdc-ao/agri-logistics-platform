'use client';

import { useState, useEffect } from 'react';

interface Prefs {
  email: boolean;
  sms: boolean;
  [k: string]: any;
}

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/notifications/preferences');
      const data = await res.json();
      setPrefs(data);
    })();
  }, []);

  const toggle = (key: string) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const save = async () => {
    setSaving(true);
    await fetch('/api/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
      headers: { 'Content-Type': 'application/json' }
    });
    setSaving(false);
  };

  if (!prefs) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Notification Preferences</h1>
      <div className="space-y-2">
        {Object.keys(prefs).map(k => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={!!prefs[k]} onChange={() => toggle(k)} />
            <span className="text-sm">{k}</span>
          </label>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}