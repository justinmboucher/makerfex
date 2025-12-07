// src/ui/components/Button.jsx
import React from "react";
import "./Button.css";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Button
 *
 * Props:
 * - variant: "primary" | "secondary" | "ghost" | "danger"
 * - size: "sm" | "md" | "lg"
 * - fullWidth: boolean
 */
export function Button({
  as,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...rest
}) {
  const Tag = as || "button";

  const classes = classNames(
    "mf-btn",
    variant && `mf-btn--${variant}`,
    size && `mf-btn--${size}`,
    fullWidth && "mf-btn--full",
    className,
  );

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
