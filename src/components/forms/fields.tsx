"use client";

import { useId, useState, type ComponentProps, type ReactNode, type Ref } from "react";
import { Paperclip, X } from "lucide-react";
import { cn } from "@/components/ui/primitives";

/**
 * Accessible form field primitives. IDs come from useId so several forms can
 * coexist in the DOM (Next.js keeps recently visited routes mounted).
 */

const controlBase =
  "block w-full rounded-md border bg-white px-3.5 text-[15px] text-ink shadow-xs transition-colors placeholder:text-muted/80 focus:border-navy-700 focus:outline-2 focus:outline-offset-0 focus:outline-navy-700/25 disabled:bg-mist disabled:text-muted";

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy-900">
        {label}
        {required ? (
          <span className="text-brand-red" aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-brand-red-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FieldProps = { label: string; error?: string; hint?: string; required?: boolean; className?: string };

export function TextInput({
  label,
  error,
  hint,
  required,
  className,
  ref,
  ...props
}: FieldProps & Omit<ComponentProps<"input">, "className"> & { ref?: Ref<HTMLInputElement> }) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <input
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          className={cn(controlBase, "h-11", invalid ? "border-brand-red" : "border-line-strong")}
          {...props}
        />
      )}
    </FormField>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  required,
  className,
  ref,
  ...props
}: FieldProps & Omit<ComponentProps<"textarea">, "className"> & { ref?: Ref<HTMLTextAreaElement> }) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <textarea
          ref={ref}
          id={id}
          rows={5}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          className={cn(controlBase, "min-h-28 py-2.5 leading-relaxed", invalid ? "border-brand-red" : "border-line-strong")}
          {...props}
        />
      )}
    </FormField>
  );
}

export function SelectField({
  label,
  error,
  hint,
  required,
  className,
  options,
  placeholder = "Select an option",
  ref,
  ...props
}: FieldProps &
  Omit<ComponentProps<"select">, "className"> & {
    options: readonly { value: string; label: string }[];
    placeholder?: string;
    ref?: Ref<HTMLSelectElement>;
  }) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <select
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          className={cn(controlBase, "h-11 pr-9", invalid ? "border-brand-red" : "border-line-strong")}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}

export function ConsentCheckbox({
  error,
  ref,
  children,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { error?: string; ref?: Ref<HTMLInputElement>; children: ReactNode }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 rounded border-line-strong accent-navy-900"
          {...props}
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-body">
          {children}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-brand-red-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FileUpload({
  label,
  hint,
  accept,
  maxBytes,
  error,
  onChange,
}: {
  label: string;
  hint: string;
  accept: string;
  maxBytes: number;
  error?: string;
  onChange: (file: File | null) => void;
}) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | undefined>();
  const shownError = localError ?? error;
  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-navy-900">
        {label} <span className="font-normal text-muted">(optional)</span>
      </span>
      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-line-strong bg-mist px-3.5 py-2.5 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <Paperclip className="size-4 shrink-0 text-navy-900" aria-hidden="true" />
            <span className="truncate">{file.name}</span>
            <span className="shrink-0 text-muted">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              onChange(null);
            }}
            className="grid size-8 place-items-center rounded-md hover:bg-white"
            aria-label={`Remove ${file.name}`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-line-strong bg-white px-4 py-5 text-sm text-body hover:border-navy-700 focus-within:outline-2 focus-within:outline-brand-red"
        >
          <Paperclip className="size-4" aria-hidden="true" />
          <span>
            <span className="font-semibold text-navy-900">Choose a file</span> to attach
          </span>
          <input
            id={id}
            type="file"
            accept={accept}
            className="sr-only"
            aria-describedby={`${id}-hint${shownError ? ` ${id}-error` : ""}`}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              e.target.value = "";
              if (f && f.size > maxBytes) {
                setLocalError(`Attachments must be ${Math.round(maxBytes / 1024 / 1024)} MB or smaller.`);
                return;
              }
              setLocalError(undefined);
              setFile(f);
              onChange(f);
            }}
          />
        </label>
      )}
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
        {hint}
      </p>
      {shownError ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-brand-red-dark">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}

/** Honeypot field: hidden from people and assistive technology, tempting to bots. */
export function HoneypotField(props: ComponentProps<"input">) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
}
