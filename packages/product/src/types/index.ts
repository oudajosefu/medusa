import { IEventBusModuleService, Logger, ProductTypes } from "@medusajs/types"

export type InitializeModuleInjectableDependencies = {
  logger?: Logger
  eventBusModuleService?: IEventBusModuleService
}

export type ProductCategoryEventData = {
  id: string
}

export enum ProductCategoryEvents {
  CATEGORY_UPDATED = "product-category.updated",
  CATEGORY_CREATED = "product-category.created",
  CATEGORY_DELETED = "product-category.deleted",
}

export type ProductEventData = {
  id: string
}

export enum ProductEvents {
  PRODUCT_UPDATED = "product.updated",
  PRODUCT_CREATED = "product.created",
  PRODUCT_DELETED = "product.deleted",
}

export type UpdateProductInput = ProductTypes.UpdateProductDTO & {
  id: string
}

export type ProductCollectionEventData = {
  id: string
}

export enum ProductCollectionEvents {
  COLLECTION_UPDATED = "product-collection.updated",
  COLLECTION_CREATED = "product-collection.created",
  COLLECTION_DELETED = "product-collection.deleted",
}

export type UpdateProductCollection =
  ProductTypes.UpdateProductCollectionDTO & {
    products?: string[]
  }

export type CreateProductCollection =
  ProductTypes.CreateProductCollectionDTO & {
    products?: string[]
  }

export type UpdateCollectionInput = ProductTypes.UpdateProductCollectionDTO & {
  id: string
}

export type UpdateProductVariantInput = ProductTypes.UpdateProductVariantDTO & {
  product_id: string
}
