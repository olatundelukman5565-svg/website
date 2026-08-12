"use client";

export function DeleteButton({
  action,
  confirmMessage,
  label = "Delete",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        {label}
      </button>
    </form>
  );
}
