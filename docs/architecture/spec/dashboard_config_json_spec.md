# Makerfex – Dashboard Configuration JSON Specification (v1)

Dashboard Configs define the *actual user or role dashboards*:
which card instances are present, their chart types, and their layout positions.

---

## 1. DashboardConfig Schema (Conceptual)

```json
{
  "id": "string",
  "name": "string",
  "ownerType": "ROLE | USER",
  "ownerId": "OWNER | MAKER | <user_id>",
  "layout": [ ...array of card instances... ]
}
```

## 2. CardInstance Schema

```json
{
  "instanceId": "unique string",
  "cardId": "id from CardDefinitions",
  "position": { "x": 0, "y": 0, "w": 4, "h": 2 },
  "overrides": {
    "title": "optional",
    "chartType": "line | bar | area",
    "timeRange": "30d | 90d | custom",
    "hidden": false
  }
}
```

#### Notes:

- ```position``` is grid-based; compatible with drag-and-drop systems such as dnd-kit or react-grid-layout.

- ```overrides``` allow per-user customization while preserving the underlying card definition.

## 3. How Configs Are Applied

### Step 1: Load DashboardConfig

Default selection logic:

1. If user has personal dashboards, use their default.

2. Otherwise, load role template (e.g., ```owner_exec_default```).

3. Otherwise, fallback to system defaults.

### Step 2: Render each CardInstance
- Merge ```CardDefinition``` + ```instance.overrides```.

- Validate capability access.

- Render appropriate card component.

## 4. Editing Dashboards (future drag-and-drop)
Operations include:

- Move card → update ```position```

- Resize card → update ```w``` and ```h```

- Change chart type → set override ```chartType```

- Hide/show card → set override ```hidden```

- Add card → add a new instance with default position

- Clone dashboard → duplicate JSON config

All editing results in one updated JSON blob stored in the backend.

## 5. Storage Recommendations
### Dashboard Model (Django):

- ```id```

- ```shop FK```

- ```user``` FK (nullable for role templates)

- ```role``` (nullable for user dashboards)

- ```config``` JSONField

- ```updated_at``` timestamp

### Indexes:

- ```(shop, user)```

- ```(shop, role)```