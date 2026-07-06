import { createMockRepository } from "./mock-repository.js";
import { clone } from "./local-utils.js";

// TODO(Production): Replace mock repository reads with authenticated AdminApi data sources after live IAM and approval owners are confirmed.
export function createAdminApi(repository = createMockRepository()) {
  return {
    systemHealthSummary() {
      return {
        ...clone(repository.status),
        jobCount: repository.jobs.length,
        errorCount: repository.errors.length,
        humanReviewTaskCount: repository.humanReviewTasks.length,
        featureFlagsOff: repository.featureFlags.every((flag) => flag.enabled === false)
      };
    },
    listJobs() {
      return clone(repository.jobs);
    },
    listErrors() {
      return clone(repository.errors);
    },
    listHumanReviewQueue() {
      return clone(repository.humanReviewTasks);
    },
    listCodexReviewQueue() {
      return clone(repository.codexReviewItems);
    },
    listFeatureFlags() {
      return clone(repository.featureFlags);
    },
    listDatasetIngestionJobs() {
      return clone(repository.datasetIngestionJobs);
    },
    marketIntelligenceRefreshStatus() {
      return clone(repository.intelligenceRefreshJobs);
    },
    displayPlacementStatus() {
      return clone(repository.displayPlacements);
    },
    backupJobStatus() {
      return clone(repository.backupJobs);
    },
    listChangeRequests() {
      return clone(repository.changeRequests);
    }
  };
}
