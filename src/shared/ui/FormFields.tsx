import { useEffect, useRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { addDaysDateOnly, isDateOnly } from "@rpa-license/domain";
import { CalendarDays } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  const holdStartRef = useRef<number | null>(null);
  const repeatRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const canStep = !disabled && isDateOnly(value);
  valueRef.current = value;

  useEffect(() => () => stopHold(), []);

  function step(days: number): boolean {
    const current = valueRef.current;
    if (!isDateOnly(current)) {
      return false;
    }
    const nextValue = addDaysDateOnly(current, days);
    valueRef.current = nextValue;
    onValueChange(nextValue);
    return true;
  }

  function startHold(days: number) {
    if (disabled || !step(days)) {
      return;
    }

    suppressClickRef.current = true;
    stopHold();
    holdStartRef.current = window.setTimeout(() => repeatStep(days, 230), 360);
  }

  function repeatStep(days: number, delay: number) {
    repeatRef.current = window.setTimeout(() => {
      if (!step(days)) {
        stopHold();
        return;
      }
      repeatStep(days, Math.max(55, Math.round(delay * 0.76)));
    }, delay);
  }

  function stopHold() {
    if (holdStartRef.current !== null) {
      window.clearTimeout(holdStartRef.current);
      holdStartRef.current = null;
    }
    if (repeatRef.current !== null) {
      window.clearTimeout(repeatRef.current);
      repeatRef.current = null;
    }
  }

  function finishHold() {
    stopHold();
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  function clickStep(days: number) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    step(days);
  }

  function openCalendar() {
    const input = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!input || disabled) {
      return;
    }

    input.focus();
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Fall through to the click fallback.
      }
    }
    input.click();
  }

  return (
    <label className={fieldClassName(className)}>
      <span>{label}</span>
      <div className={["date-control", disabled ? "is-disabled" : ""].filter(Boolean).join(" ")}>
        <div className="date-stepper" aria-hidden={disabled}>
          <Button
            variant="stepper"
            disabled={!canStep}
            onClick={() => clickStep(1)}
            onPointerCancel={finishHold}
            onPointerDown={(event) => {
              if (event.button === 0) startHold(1);
            }}
            onPointerLeave={finishHold}
            onPointerUp={finishHold}
            title="하루 증가"
            aria-label={`${label} 하루 증가`}
          >
            ▲
          </Button>
          <Button
            variant="stepper"
            disabled={!canStep}
            onClick={() => clickStep(-1)}
            onPointerCancel={finishHold}
            onPointerDown={(event) => {
              if (event.button === 0) startHold(-1);
            }}
            onPointerLeave={finishHold}
            onPointerUp={finishHold}
            title="하루 감소"
            aria-label={`${label} 하루 감소`}
          >
            ▼
          </Button>
        </div>
        <input ref={inputRef} {...props} type="date" value={value} disabled={disabled} onChange={(event) => onValueChange(event.target.value)} />
        <Button variant="icon" className="date-calendar-button" disabled={disabled} onClick={openCalendar} title="달력 열기" aria-label={`${label} 달력 열기`}>
          <CalendarDays size={16} aria-hidden="true" />
        </Button>
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
