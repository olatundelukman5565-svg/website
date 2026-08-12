"use client";

import { useEffect, useRef, useState } from "react";

interface PickedFile {
  id: string;
  file: File;
  previewUrl?: string;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function FilePicker({
  id,
  name,
  accept,
  multiple = false,
  helpText,
}: {
  id?: string;
  name: string;
  accept?: string;
  multiple?: boolean;
  helpText?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<PickedFile[]>([]);

  useEffect(() => {
    return () => {
      picked.forEach((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncInputFiles(next: PickedFile[]) {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    next.forEach((p) => dt.items.add(p.file));
    inputRef.current.files = dt.files;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? []);
    const additions: PickedFile[] = newFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: isImageFile(file) ? URL.createObjectURL(file) : undefined,
    }));
    const next = multiple ? [...picked, ...additions] : additions;
    setPicked(next);
    syncInputFiles(next);
  }

  function remove(id: string) {
    const target = picked.find((p) => p.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    const next = picked.filter((p) => p.id !== id);
    setPicked(next);
    syncInputFiles(next);
  }

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="block text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-900 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-stone-700"
      />
      {helpText && <p className="mt-1 text-xs text-stone-400">{helpText}</p>}

      {picked.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {picked.map((p) => (
            <div key={p.id} className="group relative">
              {p.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.previewUrl}
                  alt={p.file.name}
                  className="h-24 w-24 rounded-md border border-stone-200 object-cover"
                />
              ) : (
                <div className="flex h-24 w-32 flex-col items-center justify-center rounded-md border border-stone-200 bg-stone-50 p-2 text-center">
                  <span className="text-xs font-medium text-stone-600 break-all line-clamp-3">
                    {p.file.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`Remove ${p.file.name}`}
                title="Remove"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm font-bold leading-none text-white shadow hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
