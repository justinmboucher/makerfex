// src/dashboard/OwnerActivityTimeline.jsx
import React, { useMemo } from "react";
import "../styles/components/OwnerInsightRail.css";

function DefaultItems(limit = 5) {
  // Keep demo data static (no Date.now/new Date in render).
  return [
    {
      id: "a1",
      tone: "neutral",
      date: "Dec 13, 2025",
      time: "11:08 AM",
      title: "Sam moved Project #35395 to Build",
      detail: "Stage change recorded",
      href: "/projects/35395",
    },
    {
      id: "a2",
      tone: "risk",
      date: "Dec 13, 2025",
      time: "10:36 AM",
      title: "Project #35210 slipped",
      detail: "Due date moved out 2 days",
      href: "/projects/35210",
    },
    {
      id: "a3",
      tone: "success",
      date: "Dec 13, 2025",
      time: "9:00 AM",
      title: "Finishing throughput improved",
      detail: "Cycle time -6% vs last week",
      href: "/analytics?focus=throughput",
    },
    {
      id: "a4",
      tone: "revenue",
      date: "Dec 13, 2025",
      time: "6:50 AM",
      title: "Deposit collected",
      detail: "$250 received",
      href: "/analytics?focus=revenue",
    },
    {
      id: "a5",
      tone: "neutral",
      date: "Dec 12, 2025",
      time: "2:10 PM",
      title: "Walnut added to inventory",
      detail: "12 bf received",
      href: "/inventory",
    },
    {
      id: "a6",
      tone: "neutral",
      date: "Dec 11, 2025",
      time: "6:55 PM",
      title: "New customer inquiry",
      detail: "Dining table lead created",
      href: "/customers",
    },
  ].slice(0, limit);
}

export default function OwnerActivityTimeline({
  items,
  limit = 5,
  showCount = true,
  onViewAll,
}) {
  const rows = useMemo(() => {
    const src = Array.isArray(items) && items.length ? items : DefaultItems(limit);
    return src.slice(0, limit);
  }, [items, limit]);

  return (
    <div className="owner-activity">
      <div className="owner-activity__header">
        <div className="owner-activity__title">Recent Activity</div>

        <div className="owner-activity__meta">
          {showCount ? (
            <span className="owner-activity__count">{rows.length} items</span>
          ) : null}
          <button type="button" className="owner-activity__viewall" onClick={onViewAll}>
            View all →
          </button>
        </div>
      </div>

      {/* Only this area scrolls */}
      <div className="owner-activity__list" role="list">
        {rows.map((a, idx) => {
          const isLast = idx === rows.length - 1;

          const row = (
            <div className="owner-activity__row" role="listitem">
              <div className="owner-activity__left">
                <div className="owner-activity__date">{a.date}</div>
                <div className="owner-activity__time">{a.time}</div>
              </div>

              <div className="owner-activity__mid" aria-hidden="true">
                <span className={`owner-activity__dot tone-${a.tone || "neutral"}`} />
                {!isLast ? <span className="owner-activity__line" /> : null}
              </div>

              <div className="owner-activity__right">
                <div className="owner-activity__headline">{a.title}</div>
                {a.detail ? <div className="owner-activity__detail">{a.detail}</div> : null}
                <div className="owner-activity__actions">
                  <span className="owner-activity__spacer" />
                  <span className="owner-activity__link">View</span>
                </div>
              </div>
            </div>
          );

          return a.href ? (
            <a key={a.id || idx} className="owner-activity__rowlink" href={a.href}>
              {row}
            </a>
          ) : (
            <div key={a.id || idx}>{row}</div>
          );
        })}
      </div>
    </div>
  );
}
