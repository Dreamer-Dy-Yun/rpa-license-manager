import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { addDaysDateOnly, isDateOnly } from "@rpa-license/domain";
import { Button } from "./Button";

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

export interface DateFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
}

export function DateField({ label, className, value, onValueChange, disabled, ...props }: DateFieldProps) {
  const canStep = !disabled && isDateOnly(value);

  function step(days: number) {
    if (!isDateOnly(value)) {
      return;
    }
    onValueChange(addDaysDateOnly(value, days));
  }

  return (
    <label className={fieldClassName(className)}>
      <span>{label}</span>
      <div className="date-control">
        <input {...props} type="date" value={value} disabled={disabled} onChange={(event) => onValueChange(event.target.value)} />
        <div className="date-stepper" aria-hidden={disabled}>
          <Button variant="stepper" disabled={!canStep} onClick={() => step(1)} title="하루 증가" aria-label={`${label} 하루 증가`}>▲</Button>
          <Button variant="stepper" disabled={!canStep} onClick={() => step(-1)} title="하루 감소" aria-label={`${label} 하루 감소`}>▼</Button>
        </div>
      </div>
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
