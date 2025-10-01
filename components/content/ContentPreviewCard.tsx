import React from 'react';
import type { ParsedAIResponse } from '@/types/content';

export default function ContentPreviewCard({ item, onEdit }: { item: ParsedAIResponse; onEdit?: (item: ParsedAIResponse) => void }) {
  return (
    <div className="border rounded p-4 shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{item.contentType.toUpperCase()}</h3>
        <button onClick={() => onEdit?.(item)} className="text-sm text-blue-600">Edit</button>
      </div>
      <div className="mt-2 text-sm text-gray-700">
        <pre className="whitespace-pre-wrap">{JSON.stringify(item.data, null, 2)}</pre>
      </div>
    </div>
  );
}
