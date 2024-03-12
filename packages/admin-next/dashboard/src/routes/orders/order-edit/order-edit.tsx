import {
  useAdminCreateOrderEdit,
  useAdminOrder,
  useAdminOrderEdit,
} from "medusa-react"
import { useLoaderData, useParams } from "react-router-dom"
import { useEffect } from "react"

import { orderLoader } from "./loader"
import { orderExpand } from "../order-detail/constants"
import { RouteFocusModal } from "../../../components/route-modal"
import { OrderEditForm } from "./components/order-edit-form"

/**
 * Flag to ensure OE creation in useEffect is only executed once
 */
let isOECreationRunning = false

export const OrderEdit = () => {
  const { mutateAsync: createOrderEdit } = useAdminCreateOrderEdit()
  const initialData = useLoaderData() as Awaited<ReturnType<typeof orderLoader>>

  const { id } = useParams()

  const { order, isLoading, isError, error } = useAdminOrder(
    id!,
    {
      expand: orderExpand,
    },
    {
      initialData,
    }
  )

  // find created OE - there should exist only one per Order
  const _orderEdit = order?.edits.find((oe) => oe.status === "created")

  const { order_edit: orderEdit } = useAdminOrderEdit(
    _orderEdit?.id as unknown as string,
    {
      expand: "items,items.variant,items.variant.product", // TODO -> product are not joined
    },
    { enabled: !!_orderEdit?.id }
  )

  useEffect(() => {
    ;(async () => {
      if (!order || !!_orderEdit || isOECreationRunning) {
        return
      }

      isOECreationRunning = true
      await createOrderEdit({
        order_id: order.id,
        // created_by: // TODO
      })
      isOECreationRunning = false
    })()
  }, [order])

  if (isLoading || !order || !orderEdit) {
    return <div>Loading...</div>
  }

  if (isError) {
    throw error
  }

  return (
    <RouteFocusModal>
      {!isLoading && order && (
        <OrderEditForm order={order} orderEdit={orderEdit} />
      )}
    </RouteFocusModal>
  )
}