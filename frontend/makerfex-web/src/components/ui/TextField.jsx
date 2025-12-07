// src/ui/components/TextField.jsx
import React from "react";
import "./TextField.css";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * TextField
 *
 * Props:
 * - id (optional)
 * - label
 * - optional (boolean)
 * - description
 * - error
 * - size: "sm" | "md" | "lg"
 * - leftIcon: ReactNode
 * - rightAdornment: ReactNode
 */
export function TextField({
  id,
  label,
  optional = false,
  description,
  error,
  size = "md",
  leftIcon,
  rightAdornment,
  className,
  inputClassName,
  ...inputProps
}) {
  const inputId = id || (label ? slugify(label) : undefined);
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const wrapperClasses = classNames(
    "mf-input-wrapper",
    leftIcon && "mf-input-wrapper--with-left-icon",
    rightAdornment && "mf-input-wrapper--with-right-adornment",
  );

  const inputClasses = classNames(
    "mf-input",
    size !== "md" && `mf-input--${size}`,
    error && "mf-input--invalid",
    inputClassName,
  );

  return (
    <div className={classNames("mf-field", className)}>
      {label && (
        <label className="mf-field__label" htmlFor={inputId}>
          <span>{label}</span>
          {optional && <span className="mf-field__label-optional">(optional)</span>}
        </label>
      )}

      {description && (
        <div id={descriptionId} className="mf-field__description">
          {description}
        </div>
      )}

      <div className={wrapperClasses}>
        {leftIcon && <span className="mf-input__icon-left">{leftIcon}</span>}

        <input
          id={inputId}
          className={inputClasses}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
          {...inputProps}
        />

        {rightAdornment && (
          <span className="mf-input__adornment-right">{rightAdornment}</span>
        )}
      </div>

      {error && (
        <div id={errorId} className="mf-field__error">
          {error}
        </div>
      )}
    </div>
  );
}

// simple slug helper for ids
function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
