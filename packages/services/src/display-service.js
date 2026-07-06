import {
  DisplayProviderType,
  ExternalWriteSystem,
  dryRunResult
} from "../../shared/src/index.js";
import { assertLocalDryRun } from "./local-utils.js";

// TODO(Production): Replace local adapters with provider adapters only after display/write approval owners and IAM are confirmed.
export function createLocalDisplayAdapter(displayProviderType) {
  if (!Object.values(DisplayProviderType).includes(displayProviderType)) {
    throw new Error(`Unknown display provider type: ${displayProviderType}`);
  }

  const targetSystem =
    displayProviderType === DisplayProviderType.SCREEN_CLOUD
      ? ExternalWriteSystem.SCREEN_CLOUD
      : ExternalWriteSystem.DISPLAY_PROVIDER;

  return {
    displayProviderType,
    validateConfig() {
      return {
        ok: false,
        dryRun: true,
        reason: "Local skeleton does not validate live display-provider credentials."
      };
    },
    listScreens() {
      return [];
    },
    listChannels() {
      return [];
    },
    previewPlacement(placement, options = { dryRun: true }) {
      assertLocalDryRun(options, "previewPlacement");
      return dryRunResult("previewPlacement", targetSystem, { placement });
    },
    createContent(content, options = {}) {
      assertLocalDryRun(options, "createContent");
      return dryRunResult("createContent", targetSystem, { content });
    },
    updateContent(content, options = {}) {
      assertLocalDryRun(options, "updateContent");
      return dryRunResult("updateContent", targetSystem, { content });
    },
    removeContent(contentRef, options = {}) {
      assertLocalDryRun(options, "removeContent");
      return dryRunResult("removeContent", targetSystem, { contentRef });
    },
    rebuildPlaylist(playlist, options = {}) {
      assertLocalDryRun(options, "rebuildPlaylist");
      return dryRunResult("rebuildPlaylist", targetSystem, { playlist });
    },
    syncPlacement(placement, options = {}) {
      assertLocalDryRun(options, "syncPlacement");
      return dryRunResult("syncPlacement", targetSystem, { placement });
    },
    fetchPlaybackLogs(options = { dryRun: true }) {
      assertLocalDryRun(options, "fetchPlaybackLogs");
      return { dryRun: true, logs: [] };
    },
    dryRunSync(placements = [], options = { dryRun: true }) {
      assertLocalDryRun(options, "dryRunSync");
      return dryRunResult("dryRunSync", targetSystem, { placements });
    }
  };
}

export const ScreenCloudAdapter = createLocalDisplayAdapter(
  DisplayProviderType.SCREEN_CLOUD
);
export const DirectDripPlayerAdapter = createLocalDisplayAdapter(
  DisplayProviderType.DIRECT_DRIP_PLAYER
);
export const FutureProviderAdapter = createLocalDisplayAdapter(
  DisplayProviderType.FUTURE_PROVIDER
);
export const ManualExportAdapter = createLocalDisplayAdapter(
  DisplayProviderType.MANUAL_EXPORT
);
