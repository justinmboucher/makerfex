// src/pages/makerfex/Sales.tsx
import { Card } from "react-bootstrap";
import SalesOrdersTable from "../../components/makerfex/SalesOrdersTable";

export default function Sales() {
  return (
    <Card>
      <Card.Body>
        <SalesOrdersTable />
      </Card.Body>
    </Card>
  );
}
