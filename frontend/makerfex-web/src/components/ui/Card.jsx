// src/ui/components/Card.jsx
import React from "react";
import "./Card.css";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Card
 *
 * Props:
 * - as: optional element/component type (e.g. "section", Link)
 * - variant: "default" | "flat" | "subtle" | "elevated"
 * - density: "normal" | "compact" | "spacious"
 * - clickable: boolean
 */
export function Card(props) {
  const {
    as,
    variant = "default",
    density = "normal",
    clickable = false,
    className,
    children,
    ...rest
  } = props;

  const Tag = as || "div";

  const classes = classNames(
    "mf-card",
    variant !== "default" && `mf-card--${variant}`,
    density !== "normal" && `mf-card--${density}`,
    clickable && "mf-card--clickable",
    className,
  );

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ className, children, toolbar, ...rest }) {
  const classes = classNames("mf-card__header", className);
  return (
    <div className={classes} {...rest}>
      <div className="mf-card__title-group">{children}</div>
      {toolbar && <div className="mf-card__toolbar">{toolbar}</div>}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }) {
  const classes = classNames("mf-card__title", className);
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardSubtitle({ className, children, ...rest }) {
  const classes = classNames("mf-card__subtitle", className);
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }) {
  const classes = classNames("mf-card__body", className);
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }) {
  const classes = classNames("mf-card__footer", className);
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardSection({ className, children, ...rest }) {
  const classes = classNames("mf-card__section", className);
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
