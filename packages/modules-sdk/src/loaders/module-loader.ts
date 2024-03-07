import {
  Logger,
  MedusaContainer,
  MODULE_SCOPE,
  ModuleResolution,
} from "@medusajs/types"

import { asValue } from "awilix"
import { EOL } from "os"
import { loadExternalModule, loadInternalModule } from "./utils"

export const moduleLoader = async ({
  container,
  moduleResolutions,
  logger,
  migrationOnly,
  loaderOnly,
}: {
  container: MedusaContainer
  moduleResolutions: Record<string, ModuleResolution>
  logger: Logger
  migrationOnly?: boolean
  loaderOnly?: boolean
}): Promise<void> => {
  for (const resolution of Object.values(moduleResolutions ?? {})) {
    const registrationResult = await loadModule(
      container,
      resolution,
      logger!,
      migrationOnly,
      loaderOnly
    )

    if (registrationResult?.error) {
      const { error } = registrationResult
      if (resolution.definition.isRequired) {
        logger?.error(
          `Could not resolve required module: ${resolution.definition.label}. Error: ${error.message}${EOL}`
        )
        throw error
      }

      logger?.warn(
        `Could not resolve module: ${resolution.definition.label}. Error: ${error.message}${EOL}`
      )
    }
  }
}

async function loadModule(
  container: MedusaContainer,
  resolution: ModuleResolution,
  logger: Logger,
  migrationOnly?: boolean,
  loaderOnly?: boolean
): Promise<{ error?: Error } | void> {
  const modDefinition = resolution.definition
  const registrationName = modDefinition.registrationName

  const { scope, resources } = resolution.moduleDeclaration ?? ({} as any)

  if (scope === MODULE_SCOPE.EXTERNAL) {
    return await loadExternalModule(container, resolution, logger)
  }

  if (!scope || (scope === MODULE_SCOPE.INTERNAL && !resources)) {
    let message = `The module ${resolution.definition.label} has to define its scope (internal | external)`
    if (scope === MODULE_SCOPE.INTERNAL && !resources) {
      message = `The module ${resolution.definition.label} is missing its resources config`
    }

    container.register(registrationName, asValue(undefined))

    return {
      error: new Error(message),
    }
  }

  if (resolution.resolutionPath === false) {
    container.register(registrationName, asValue(undefined))

    return
  }

  return await loadInternalModule(
    container,
    resolution,
    logger,
    migrationOnly,
    loaderOnly
  )
}
