"use client";
import React from 'react';

type Relationship = any;

export default function RelationshipGraph({ relationships }: { relationships: Relationship[] }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Relationship Network</h3>
        <span className="text-xs text-white/50">{relationships?.length ?? 0} connections</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {(relationships && relationships.length > 0) ? (
          relationships.map((r: any, i: number) => (
            <div key={i} className="glass rounded-lg p-3 flex items-center justify-between hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-yellow-400 flex items-center justify-center text-white font-bold">{((r.entity_name || 'U')[0])}</div>
                <div>
                  <p className="text-white font-medium">{r.entity_name}</p>
                  <p className="text-xs text-white/50">{r.relationship_type}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70">{r.status || 'neutral'}</span>
                <p className="text-xs text-white/40">{r.last_interaction ? new Date(r.last_interaction).toLocaleString() : '—'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-white/50 p-4">No relationships recorded yet</div>
        )}
      </div>
    </div>
  );
}
