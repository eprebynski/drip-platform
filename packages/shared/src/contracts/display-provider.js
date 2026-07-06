import {
  DisplayProviderType,
  ExternalWriteSystem
} from "../status/index.js";
import {
  assertExternalWriteAllowed,
  dryRunResult
} from "./dry-run-guard.js";

export const DisplayProviderServiceMethods = Object.freeze([
  "validateConfig",
  "listScreens",
  "listChannels",
  "previewPlacement",
  "createContent",
  "updateContent",
  "removeContent",
  "rebuildPlaylist",
  "syncPlacement",
  "fetchPlaybackLogs",
  "dryRunSync"
]);

// Phase 1 adapters are intentionally non-production stubs; no live display-provider writes.
export class NonProductionAdapterError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "NonProductionAdapterError";
    this.details = details;
  }
}

export function createNonProductionDisplayAdapter(displayProviderType) {
  if (!Object.values(DisplayProviderType).includes(displayProviderType)) {
    throw new NonProductionAdapterError("Unknown display provider type", {
      displayProviderType
    });
  }

  const targetSystem =
    displayProviderType === DisplayProviderType.SCREEN_CLOUD
      ? ExternalWriteSystem.SCREEN_CLOUD
      : ExternalWriteSystem.DISPLAY_PROVIDER;

  return Object.freeze({
    displayProviderType,
    async validateConfig() {
      return {
        ok: false,
        dryRun: true,
        reason: "Non-production stub does not validate live credentials"
      };
    },
    async listScreens() {
      return [];
    },
    async listChannels() {
      return [];
    },
    async previewPlacement(placement) {
      return dryRunResult("previewPlacement", targetSystem, { placement });
    },
    async createContent(content, options = {}) {
      return guardedStub("createContent", targetSystem, content, options);
    },
    async updateContent(content, options = {}) {
      return guardedStub("updateContent", targetSystem, content, options);
    },
    async removeContent(contentRef, options = {}) {
      return guardedStub("removeContent", targetSystem, contentRef, options);
    },
    async rebuildPlaylist(playlist, options = {}) {
      return guardedStub("rebuildPlaylist", targetSystem, playlist, options);
    },
    async syncPlacement(placement, options = {}) {
      return guardedStub("syncPlacement", targetSystem, placement, options);
    },
    async fetchPlaybackLogs() {
      return {
        dryRun: true,
        logs: [],
        reason: "Non-production stub does not call display provider APIs"
      };
    },
    async dryRunSync(placements = []) {
      return dryRunResult("dryRunSync", targetSystem, { placements });
    }
  });
}

function guardedStub(operation, targetSystem, input, options) {
  const decision = assertExternalWriteAllowed({
    operation,
    targetSystem,
    ...options
  });

  throw new NonProductionAdapterError(
    `${operation} is contract-only in Phase 1 and cannot perform a live write`,
    { decision, input }
  );
}

export const ScreenCloudAdapter = createNonProductionDisplayAdapter(
  DisplayProviderType.SCREEN_CLOUD
);
export const DirectDripPlayerAdapter = createNonProductionDisplayAdapter(
  DisplayProviderType.DIRECT_DRIP_PLAYER
);
export const FutureProviderAdapter = createNonProductionDisplayAdapter(
  DisplayProviderType.FUTURE_PROVIDER
);
export const ManualExportAdapter = createNonProductionDisplayAdapter(
  DisplayProviderType.MANUAL_EXPORT
);
