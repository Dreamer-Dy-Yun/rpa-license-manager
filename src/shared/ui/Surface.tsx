import type { FormHTMLAttributes, HTMLAttributes } from "react";

function classNames(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function Stack({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={classNames("stack", className)} />;
}

export function FormPanel({ className, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  return <form {...props} className={classNames("panel", "form-grid", className)} />;
}

export function FilterPanel({ className, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  return <form {...props} className={classNames("panel", "filter-grid", className)} />;
}

export function FormActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames("form-actions", className)} />;
}

export function FormMessage({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={classNames("form-message", className)} />;
}

export function TablePanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames("panel", "table-wrap", className)} />;
}

export function TableActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames("table-actions", className)} />;
}

export function TableEmpty({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={classNames("table-empty", className)} />;
}

export function EmptyState({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={classNames("empty-state", className)} />;
}

export function LoadingState({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={classNames("loading", className)} />;
}

interface NoticeProps extends HTMLAttributes<HTMLElement> {
  tone?: "default" | "info" | "danger";
}

export function Notice({ className, tone = "default", ...props }: NoticeProps) {
  const toneClass = tone === "default" ? undefined : `notice-${tone}`;
  return <section {...props} className={classNames("notice", toneClass, className)} />;
}

export function TabList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames("tab-list", className)} />;
}
