// src/dashboard/OwnerInsightRail.jsx
import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Gauge,
  DollarSign,
} from "lucide-react";
import OwnerActivityTimeline from "./OwnerActivityTimeline";
import "../styles/components/OwnerInsightRail.css";

/**
 * OwnerInsightRail
 *
 * Layout-level right sidebar for the app (insights/notifications).
 * Handles:
 * - Tabs: Insights vs Notifications (backend later)
 * - Collapse/expand (collapse button lives in header)
 * - Insight sections (scaffolded)
 * - Pinned bottom: Recent Activity (timeline) always visible when open
 *
 * Controlled/uncontrolled:
 * - If `tab` is provided, controlled tab state.
 * - If not, internal state only (no prop->state syncing effects).
 */

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Section({ tone = "neutral", icon: Icon, title, children }) {
  return (
    <div className={cx("owner-insight-rail__section", `tone-${tone}`)}>
      <div className="owner-insight-rail__section-header">
        <div className="owner-insight-rail__section-title">
          {Icon ? <Icon size={16} /> : null}
          <span>{title}</span>
        </div>
      </div>
      <div className="owner-insight-rail__section-body">{children}</div>
    </div>
  );
}

function InsightItem({ label, value, hint, href }) {
  const content = (
    <>
      <div className="owner-insight-rail__item-top">
        <span className="owner-insight-rail__item-label">{label}</span>
        {value != null ? (
          <span className="owner-insight-rail__item-value">{value}</span>
        ) : null}
      </div>
      {hint ? <div className="owner-insight-rail__item-hint">{hint}</div> : null}
    </>
  );

  return href ? (
    <a className="owner-insight-rail__item owner-insight-rail__item--link" href={href}>
      {content}
    </a>
  ) : (
    <div className="owner-insight-rail__item">{content}</div>
  );
}

export default function OwnerInsightRail({
  open = true,
  onToggle,
  tab, // optional controlled tab: "insights" | "notifications"
  onTabChange,
  defaultTab = "insights",
  insights,
  activityItems, // optional feed for timeline
}) {
  const [internalTab, setInternalTab] = useState(defaultTab);
  const activeTab = tab ?? internalTab;

  function setTab(next) {
    onTabChange?.(next);
    if (tab == null) setInternalTab(next);
  }

  const model = useMemo(() => {
    return (
      insights || {
        urgent: [
          { label: "Capacity risk", value: "—", hint: "Wire later.", href: "/projects?focus=capacity-risk" },
          { label: "Next bottleneck", value: "—", hint: "Wire later.", href: "/analytics?focus=bottleneck" },
        ],
        capacity: [
          { label: "WIP concentration", value: "—", hint: "Which stage is eating your calendar?", href: "/analytics?focus=wip" },
          { label: "Throughput trend", value: "—", hint: "Context only (not the main story).", href: "/analytics?focus=throughput" },
        ],
        revenue: [
          { label: "Revenue (context)", value: "—", hint: "Secondary by default; expand later.", href: "/analytics?focus=revenue" },
        ],
      }
    );
  }, [insights]);

  // CLOSED: only show the reopen handle (no bell here; topbar owns notifications)
  if (!open) {
    return (
      <aside className="owner-insight-drawer is-closed">
        <button
          type="button"
          className="owner-insight-drawer__handle"
          onClick={() => onToggle?.(true)}
          aria-label="Open insights drawer"
          title="Open"
        >
          <ChevronLeft size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="owner-insight-drawer is-open">
      <div className="owner-insight-rail">
        {/* Header: tabs + collapse button (in header, per your mock) */}
        <div className="owner-insight-rail__top">
          <div className="owner-insight-rail__tabs" role="tablist" aria-label="Insights drawer tabs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "insights"}
              className={cx("owner-insight-rail__tab", activeTab === "insights" && "is-active")}
              onClick={() => setTab("insights")}
            >
              Insights
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "notifications"}
              className={cx("owner-insight-rail__tab", activeTab === "notifications" && "is-active")}
              onClick={() => setTab("notifications")}
            >
              Notifications
            </button>
          </div>

          <button
            type="button"
            className="owner-insight-rail__collapse"
            onClick={() => onToggle?.(false)}
            aria-label="Collapse insights drawer"
            title="Collapse"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Middle region scrolls (NOT the whole page) */}
        <div className="owner-insight-rail__middle">
          {activeTab === "insights" ? (
            <div className="owner-insight-rail__content">
              <Section tone="risk" icon={AlertTriangle} title="Urgent">
                {model.urgent.map((x, idx) => (
                  <InsightItem key={idx} {...x} />
                ))}
              </Section>

              <Section tone="capacity" icon={Gauge} title="Capacity">
                {model.capacity.map((x, idx) => (
                  <InsightItem key={idx} {...x} />
                ))}
              </Section>

              <Section tone="revenue" icon={DollarSign} title="Revenue (context)">
                {model.revenue.map((x, idx) => (
                  <InsightItem key={idx} {...x} />
                ))}
              </Section>
            </div>
          ) : (
            <div className="owner-insight-rail__content">
              <div className="owner-insight-rail__empty">
                Notifications UI is scaffolded. Backend wiring comes later.
              </div>
            </div>
          )}
        </div>

        {/* Bottom stays pinned and timeline list scrolls internally */}
        <div className="owner-insight-rail__bottom">
          <OwnerActivityTimeline items={activityItems} limit={5} />
        </div>
      </div>
    </aside>
  );
}
