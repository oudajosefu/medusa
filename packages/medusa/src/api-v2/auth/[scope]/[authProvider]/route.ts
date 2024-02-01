import { AuthenticationInput, IAuthModuleService } from "@medusajs/types"
import { MedusaRequest, MedusaResponse } from "../../../../types/routing"

import { MedusaError } from "@medusajs/utils"
import { ModuleRegistrationName } from "@medusajs/modules-sdk"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { scope, authProvider } = req.params

  const service: IAuthModuleService = req.scope.resolve(
    ModuleRegistrationName.AUTH
  )

  const authData = {
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    authScope: scope,
  } as AuthenticationInput

  const authResult = await service.authenticate(authProvider, authData)

  const { success, error, authUser, location } = authResult
  if (location) {
    res.redirect(location)
    return
  }

  if (!success && error) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, error)
  } else if (success) {
    req.session.auth_user = authUser
    req.session.scope = authUser.scope

    res.status(200).json({ authUser })
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  await GET(req, res)
}
