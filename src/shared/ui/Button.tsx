import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon" | "menu" | "tab" | "table" | "stepper" | "card";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  active?: boolean;
}

export function Button({ variant = "secondary", active, className, type = "button", ...props }: ButtonProps) {
  const classes = ["ui-button", `ui-button-${variant}`, active ? "is-active" : "", className].filter(Boolean).join(" ");

  return <button {...props} className={classes} type={type} />;
}
