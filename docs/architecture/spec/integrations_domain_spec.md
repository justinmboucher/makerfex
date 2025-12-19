# Integrations Domain Spec

## Terminology Cheat Sheet

- **Provider** – A type of external system or service (Etsy, Shopify, Instagram, Vendor Service).
- **Connection** – A shop-scoped instance of a provider with configuration and status.
- **Credential** – Secret material (API keys, OAuth tokens) used by a connection.
- **Event Log** – A time-ordered record of integration activity for audit and debugging.
- **Capability** – A discrete action an integration can perform (import orders, sync products, post to Instagram).
- **Vendor Service** – A non-API external service (e.g., packing, painting) primarily represented by invoices and workflow handoff.

---

## 1. Purpose

Makerfex requires a dedicated **Integrations** domain to manage external systems and service vendors without overloading the Employees or Accounts domains.

This domain supports two classes of integrations:

1. **API Integrations** – Etsy, Shopify, Instagram, Slack/Discord (future)
2. **Service Vendor Integrations** – packing/shipping, paint services, or other third-party shop services that operate primarily via invoices rather than APIs

The Integrations domain ensures external connectivity is shop-scoped, auditable, secure, and operationally usable.

---

## 2. Non-Goals (v1)

- No integration marketplace or app store
- No billing or subscription management
- No pushing updates back to Etsy or Shopify (tracking, fulfillment, etc.)
- No inbound webhooks required (but architecture must not block them)
- No analytics imports (Splunk-style integrations are future scope)

---

## 3. Domain Boundaries

### Accounts Domain
Owns:
- Employees and roles
- Station membership
- Shop scoping and permissions
- Human identity and operational roles

Does NOT own:
- External provider configuration
- API credentials or tokens
- Integration events or sync state

### Integrations Domain
Owns:
- Providers and capabilities
- Shop-level connections
- Credentials and secret handling
- Integration event logs
- Sync actions and operational triggers

---

## 4. Core Concepts

### Provider
A canonical integration type defining:
- Authentication method (OAuth, API key, none)
- Supported capabilities
- Configuration requirements

Examples:
- etsy
- shopify
- instagram
- vendor_service

### Connection
A shop-scoped instance of a provider.
Includes:
- Enabled/disabled state
- Health status
- Non-secret configuration
- Capability toggles
- Sync cursors and timestamps

One connection per provider per shop.

### Credential
Secret material tied to a connection.
Rules:
- Encrypted at rest
- Never returned in plaintext
- Rotatable and revocable
- Audited on change

### Integration Event Log
Shop-scoped activity timeline.
Used for:
- Auditing
- Debugging
- Operational visibility

Retention: **90 days**, exportable as CSV.

---

## 5. Supported Integrations (v1)

### Etsy
- Import orders as Projects
- Sync products and inventory
- Import customers
- No outbound updates

### Shopify
- Import orders as Projects
- Sync products and inventory
- Import customers
- No outbound updates

### Instagram
- Post products from Makerfex to Instagram
- No message, comment, or analytics sync

### Vendor / Service Integrations
- Represent non-API services
- Primary output is invoice/work-order generation
- No OAuth or API requirement
- Used for packing, painting, or other outsourced shop work

---

## 6. Invoices (Canonical Sales Artifact)

Invoices are first-class business records and belong to the **Sales** domain.

Integrations may:
- Trigger invoice creation
- Attach metadata to invoices
- Export or transmit invoices externally

Invoices:
- Are generated for all sales (including craft fairs)
- Support PDF output
- May include optional BOM breakdown for records

---

## 7. Ownership Model

- Shop → IntegrationConnections
- Connection → Credential
- Connection → Event Logs

Uniqueness:
- One connection per provider per shop

---

## 8. Permissions

Roles:
- Owner
- shop_manager
- manager
- employee

### Configuration
- Owner, shop_manager only

### Usage
- manager and employee allowed if capability enabled

---

## 9. Conceptual Data Model

### IntegrationProvider
- key
- label
- category (api | vendor)
- auth_type
- capabilities

### IntegrationConnection
- shop
- provider_key
- status
- health
- config (JSON)
- enabled_capabilities
- last_synced_at
- sync_cursor
- created_by

### IntegrationCredential
- connection
- kind
- encrypted_secret
- scopes
- expires_at
- revoked_at
- created_by

### IntegrationEventLog
- shop
- connection (nullable)
- level
- event_type
- message
- meta (JSON)
- actor
- created_at

---

## 10. API Surface (Conceptual)

### Providers
- GET /api/integrations/providers/

### Connections
- GET /api/integrations/connections/
- POST /api/integrations/connections/
- PATCH /api/integrations/connections/{id}/
- POST /enable /disable /test

### Credentials
- POST /connections/{id}/credential/
- POST /connections/{id}/revoke/

### Actions
- import_orders
- sync_products
- import_customers
- post_instagram_product
- vendor_handoff_invoice

### Events
- GET /api/integrations/events/
- GET /api/integrations/events/export.csv

---

## 11. Security

- All endpoints shop-scoped
- Secrets encrypted at rest
- Secrets masked in responses
- Full audit logging of credential changes

---

## 12. Background Jobs (Roadmap)

- Import and sync actions run async
- Events record job lifecycle
- Celery-compatible design

---

## 13. Webhooks (Roadmap)

- Provider-specific webhook endpoints
- Verification secrets
- Idempotent event processing

---

## 14. Migration Notes

- Demo vendor integrations (e.g., Packright) represent vendor_service providers
- Remove any integration logic from Employee records
- Migrate vendor workflows into Integrations + Sales linkage

---

## Acceptance Criteria

- Clean separation from Employees domain
- Shop-scoped configuration and permissions
- CSV export of last 90 days of events
- Instagram posting supported as an operational action
