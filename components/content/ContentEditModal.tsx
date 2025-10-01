import React, { useState } from 'react';
import type { GeneratedContent } from '@/types/database';

export default function ContentEditModal({ open, item, onClose, onSave }: { open: boolean; item?: GeneratedContent | null; onClose: () => void; onSave: (updated: GeneratedContent) => void }) {
  const [draft, setDraft] = useState<string>(() => JSON.stringify(item?.content_data ?? {}, null, 2));

  React.useEffect(() => {
    setDraft(JSON.stringify(item?.content_data ?? {}, null, 2));
  }, [item]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded p-4 w-11/12 max-w-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Content</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>
        <textarea className="w-full h-64 mt-3 p-2 border rounded" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <div className="flex justify-end gap-2 mt-3">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => {
            try {
              const parsed = JSON.parse(draft);
              const updated: GeneratedContent = { ...(item as any), content_data: parsed } as any;
              // Delegate persistence to parent; parent will close modal on success
              onSave(updated);
            } catch (e) {
              alert('Invalid JSON');
            }
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}
