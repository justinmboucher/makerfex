from django.db import transaction
from django.core.exceptions import ValidationError

from inventory.models import InventoryTransaction, Material, Consumable, Equipment


def apply_inventory_transaction(
    *,
    shop,
    inventory_type,
    inventory_id,
    quantity_delta,
    reason,
    project=None,
    bom_snapshot_type=None,
    bom_snapshot_id=None,
    station=None,
    created_by=None,
    notes="",
):
    """
    Apply an inventory transaction and eagerly update quantity_on_hand.

    This is the ONLY place inventory quantities should change.
    """

    if quantity_delta == 0:
        raise ValidationError("quantity_delta cannot be zero.")

    inventory_type = inventory_type.lower()

    if inventory_type == InventoryTransaction.InventoryType.MATERIAL:
        model = Material
        fk_field = "material"
    elif inventory_type == InventoryTransaction.InventoryType.CONSUMABLE:
        model = Consumable
        fk_field = "consumable"
    elif inventory_type == InventoryTransaction.InventoryType.EQUIPMENT:
        model = Equipment
        fk_field = "equipment"
    else:
        raise ValidationError(f"Invalid inventory_type: {inventory_type}")

    try:
        inventory_item = model.objects.select_for_update().get(
            id=inventory_id,
            shop=shop,
        )
    except model.DoesNotExist:
        raise ValidationError("Inventory item not found for this shop.")

    with transaction.atomic():
        # Update quantity on hand (Option A)
        inventory_item.quantity_on_hand += quantity_delta
        inventory_item.save(update_fields=["quantity_on_hand"])

        txn_kwargs = {
            "shop": shop,
            "inventory_type": inventory_type,
            "quantity_delta": quantity_delta,
            "reason": reason,
            "project": project,
            "bom_snapshot_type": bom_snapshot_type or "",
            "bom_snapshot_id": bom_snapshot_id,
            "station": station,
            "created_by": created_by,
            "notes": notes,
        }

        txn_kwargs[fk_field] = inventory_item

        txn = InventoryTransaction.objects.create(**txn_kwargs)

    return txn