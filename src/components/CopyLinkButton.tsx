"use client"

import React from 'react';

export default function CopyLinkButton({ link }: { link: string }) {
  return (
    <button
      className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
      onClick={() => {navigator.clipboard.writeText(link)}}
      title="Copiar link"
      type="button"
    >
      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
    </button>
  );
} 