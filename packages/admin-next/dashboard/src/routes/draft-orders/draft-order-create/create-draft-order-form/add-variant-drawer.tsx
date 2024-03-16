import { PricedVariant } from "@medusajs/medusa/dist/types/pricing"
import { Button, Checkbox } from "@medusajs/ui"
import {
  OnChangeFn,
  RowSelectionState,
  createColumnHelper,
} from "@tanstack/react-table"
import { useAdminVariants } from "medusa-react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { SplitView } from "../../../../components/layout/split-view"
import { DataTable } from "../../../../components/table/data-table"
import { MoneyAmountCell } from "../../../../components/table/table-cells/common/money-amount-cell"
import { PlaceholderCell } from "../../../../components/table/table-cells/common/placeholder-cell"
import { ProductCell } from "../../../../components/table/table-cells/product/product-cell"
import { useDataTable } from "../../../../hooks/use-data-table"
import { ExistingItem } from "./types"

type AddVariantDrawerProps = {
  onSave: (items: ExistingItem[]) => void
  items?: ExistingItem[]
  regionId?: string
  customerId?: string
  currencyCode?: string
}

const PAGE_SIZE = 50

const initRowState = (items: ExistingItem[]): RowSelectionState => {
  return items.reduce((acc, curr) => {
    acc[curr.variant_id] = true
    return acc
  }, {} as RowSelectionState)
}

export const AddVariantDrawer = ({
  onSave,
  items = [],
  regionId,
  customerId,
  currencyCode,
}: AddVariantDrawerProps) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initRowState(items)
  )
  const [intermediate, setIntermediate] = useState<ExistingItem[]>(items)

  const { t } = useTranslation()

  const { variants, count, isLoading, isError, error } = useAdminVariants({
    region_id: regionId,
    customer_id: customerId,
  })

  const updater: OnChangeFn<RowSelectionState> = (fn) => {
    const newState: RowSelectionState =
      typeof fn === "function" ? fn(rowSelection) : fn

    const diff = Object.keys(newState).filter(
      (k) => newState[k] !== rowSelection[k]
    )

    const addedVariants = variants?.filter((p) => diff.includes(p.id!)) ?? []

    const newVariants: ExistingItem[] = addedVariants.map((v) => ({
      variant_id: v.id!,
      variant_title: v.title!,
      unit_price: v.original_price!,
      sku: v.sku ?? undefined,
      product_title: v.product?.title,
      thumbnail: v.product?.thumbnail ?? undefined,
      quantity: 1,
    }))

    setIntermediate((prev) => {
      const filteredPrev = prev.filter((p) =>
        Object.keys(newState).includes(p.variant_id)
      )

      const update = Array.from(new Set([...filteredPrev, ...newVariants]))
      return update
    })

    setRowSelection(newState)
  }

  const handleSave = () => {
    onSave(intermediate)
  }

  const columns = useVariantTableColumns()

  const { table } = useDataTable({
    data: variants || [],
    columns,
    count,
    pageSize: PAGE_SIZE,
    enablePagination: true,
    enableRowSelection: true,
    getRowId: (row) => row.id!,
    rowSelection: {
      state: rowSelection,
      updater,
    },
    meta: {
      currencyCode,
    },
  })

  if (isError) {
    throw error
  }

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <DataTable
        table={table}
        columns={columns}
        count={count}
        isLoading={isLoading}
        queryObject={{}}
        pageSize={PAGE_SIZE}
        pagination
        search
        layout="fill"
      />
      <div className="flex items-center justify-end gap-x-2 border-t p-4">
        <SplitView.Close type="button" asChild>
          <Button variant="secondary" size="small">
            {t("actions.cancel")}
          </Button>
        </SplitView.Close>
        <Button size="small" type="button" onClick={handleSave}>
          {t("actions.save")}
        </Button>
      </div>
    </div>
  )
}

const columnHelper = createColumnHelper<PricedVariant>()

const useVariantTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : table.getIsAllPageRowsSelected()
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          )
        },
        cell: ({ row }) => {
          return (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
          )
        },
      }),
      columnHelper.accessor("product", {
        header: t("fields.product"),
        cell: ({ getValue }) => {
          const product = getValue()

          if (!product) {
            return <PlaceholderCell />
          }

          return <ProductCell product={product} />
        },
      }),
      columnHelper.accessor("options", {
        header: t("fields.variant"),
        cell: ({ getValue }) => {
          const options = getValue()

          const displayValue = options?.map((o) => o.value).join(" · ")

          return (
            <div className="flex size-full items-center overflow-hidden">
              <span className="truncate">{displayValue}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor("sku", {
        header: t("fields.sku"),
        cell: ({ getValue }) => {
          const sku = getValue()

          return (
            <div className="flex size-full items-center overflow-hidden">
              <span className="truncate">{sku ?? "-"}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor("original_price", {
        header: () => (
          <div className="flex size-full items-center justify-end overflow-hidden text-right">
            <span className="truncate">{t("fields.unitPrice")}</span>
          </div>
        ),
        cell: ({ getValue, table }) => {
          const price = getValue()
          const { currencyCode } = table.options.meta as {
            currencyCode?: string
          }

          if (!price || !currencyCode) {
            return <PlaceholderCell />
          }

          return (
            <MoneyAmountCell
              align="right"
              amount={price}
              currencyCode={currencyCode}
            />
          )
        },
      }),
    ],
    [t]
  )
}