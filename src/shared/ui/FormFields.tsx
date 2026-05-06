import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

function fieldClassName(className?: string): string {
  return ["field", className].filter(Boolean).join(" ");
}

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export function InputField({ label, className, ...props }: InputFieldProps) {
  return (
    <label className={fieldClassName(className)}>
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  values: readonly string[];
  includeAll?: boolean;
  placeholder?: string | null;
}

export function SelectField({ label, values, includeAll, placeholder = "선택", className, ...props }: SelectFieldProps) {
  return (
    <label className={fieldClassName(className)}>
      <span>{label}</span>
      <select {...props}>
        {includeAll ? <option value="">전체</option> : null}
        {!includeAll && placeholder !== null ? <option value="">{placeholder}</option> : null}
        {values.map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>
    </label>
  );
}

export interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
}

export function TextAreaField({ label, className, ...props }: TextAreaFieldProps) {
  return (
    <label className={fieldClassName(className)}>
      <span>{label}</span>
      <textarea {...props} />
    </label>
  );
}
