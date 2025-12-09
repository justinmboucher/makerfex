// src/pages/Projects.jsx
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
} from "../components/ui/Card";

export default function Projects() {
  return (
    <div className="mf-grid-12">
      <div className="mf-grid-span-12">
        <h1 style={{ marginBottom: "0.5rem" }}>Projects</h1>
        <p style={{ marginBottom: "1.5rem", color: "var(--mf-color-text-secondary)" }}>
          Project list & board coming soon. For now this is just a sanity check
          that the layout and routing are wired correctly.
        </p>
      </div>

      <div className="mf-grid-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Projects placeholder</CardTitle>
            <CardSubtitle>
              Replace this with your actual projects table when ready.
            </CardSubtitle>
          </CardHeader>
          <CardBody>
            <p>
              If you can see this card, routing and layout are fine and any
              previous white screen was coming from the old{" "}
              <code>Projects.jsx</code> implementation.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
