// src/components/layout/PageShell.jsx
import React from "react";
import "../../styles/layout/PageShell.css";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

/**
 * PageShell
 *
 * Generic layout wrapper for main pages.
 * Handles:
 * - Title / subtitle / description
 * - Optional eyebrow label
 * - Optional right-side header content (headerAside)
 * - Optional toolbar (toolbarContent + secondaryActions)
 * - Consistent padding
 *
 * Keep page-specific logic OUT of here – this is just layout.
 */

export function PageShell({
  title,
  subtitle,
  description,
  eyebrow,
  primaryAction,
  secondaryActions = [],
  headerAside,
  toolbarContent,
  children,
}) {
  return (
    <div className="mf-page-shell">
      {/* HEADER */}
      {(title || subtitle || eyebrow || headerAside || description) && (
        <header className="mf-page-shell__header">
          <div className="mf-page-shell__header-main">
            <div className="mf-page-shell__header-text">
              {eyebrow && (
                <div className="mf-page-shell__eyebrow">{eyebrow}</div>
              )}

              {title && (
                <h1 className="mf-page-shell__title">
                  {title}
                </h1>
              )}

              {subtitle && (
                <p className="mf-page-shell__subtitle">
                  {subtitle}
                </p>
              )}
            </div>

            {(headerAside || primaryAction || secondaryActions.length > 0) && (
              <div className="mf-page-shell__header-right">
                {headerAside && (
                  <div className="mf-page-shell__header-aside">
                    {headerAside}
                  </div>
                )}

                {(secondaryActions.length > 0 || primaryAction) && (
                  <div className="mf-page-shell__header-actions">
                    {secondaryActions.map((action) => {
                      const key = action.key || action.label;
                      const As = action.to ? Link : "button";
                      return (
                        <Button
                          key={key}
                          variant={action.variant || "ghost"}
                          size={action.size || "sm"}
                          as={As}
                          to={action.to}
                          onClick={action.onClick}
                        >
                          {action.icon && (
                            <span className="mf-page-shell__toolbar-icon">
                              {action.icon}
                            </span>
                          )}
                          {action.label}
                        </Button>
                      );
                    })}

                    {primaryAction && (
                      <Button
                        variant={primaryAction.variant || "primary"}
                        size={primaryAction.size || "sm"}
                        as={primaryAction.to ? Link : "button"}
                        to={primaryAction.to}
                        onClick={primaryAction.onClick}
                      >
                        {primaryAction.icon && (
                          <span className="mf-page-shell__toolbar-icon">
                            {primaryAction.icon}
                          </span>
                        )}
                        {primaryAction.label}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {description && (
            <p className="mf-page-shell__description">
              {description}
            </p>
          )}
        </header>
      )}

      {/* TOOLBAR (search, filters, etc.) */}
      {(toolbarContent || secondaryActions.length > 0) && (
        <div className="mf-page-shell__toolbar">
          <div className="mf-page-shell__toolbar-left">
            {toolbarContent}
          </div>

          <div className="mf-page-shell__toolbar-right">
            {secondaryActions.map((action) => {
              const key = action.key || action.label;
              const As = action.to ? Link : "button";
              return (
                <Button
                  key={key}
                  variant={action.variant || "ghost"}
                  size={action.size || "sm"}
                  as={As}
                  to={action.to}
                  onClick={action.onClick}
                >
                  {action.icon && (
                    <span className="mf-page-shell__toolbar-icon">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="mf-page-shell__body">
        {children}
      </div>
    </div>
  );
}

/**
 * PageSection
 * Simple wrapper for content sections inside PageShell.
 * Good for tables, grids, card groups, etc.
 */
export function PageSection({ children, className = "" }) {
  return (
    <section className={`mf-page-section ${className}`}>
      {children}
    </section>
  );
}
