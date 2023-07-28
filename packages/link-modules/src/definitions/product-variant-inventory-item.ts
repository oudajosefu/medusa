import { LINKS } from "../links"
import { ModuleJoinerConfig } from "@medusajs/types"
import { Modules } from "@medusajs/modules-sdk"

export const ProductVariantInventoryItem: ModuleJoinerConfig = {
  serviceName: LINKS.ProductVariantInventoryItem,
  isLink: true,
  alias: [
    {
      name: "product_variant_inventory_item",
    },
    {
      name: "product_variant_inventory_items",
    },
  ],
  primaryKeys: ["id", "variant_id", "inventory_item_id"],
  relationships: [
    {
      serviceName: Modules.PRODUCT,
      primaryKey: "id",
      foreignKey: "variant_id",
      alias: "variant",
      args: {
        methodSuffix: "Variants",
      },
    },
    {
      serviceName: Modules.INVENTORY,
      primaryKey: "id",
      foreignKey: "inventory_item_id",
      alias: "inventory",
    },
  ],
  extends: [
    {
      serviceName: Modules.PRODUCT,
      relationship: {
        serviceName: LINKS.ProductVariantInventoryItem,
        primaryKey: "variant_id",
        foreignKey: "id",
        alias: "inventory_items",
        isList: true,
      },
    },
    {
      serviceName: Modules.INVENTORY,
      relationship: {
        serviceName: LINKS.ProductVariantInventoryItem,
        primaryKey: "inventory_item_id",
        foreignKey: "id",
        alias: "variant",
      },
    },
  ],
}
