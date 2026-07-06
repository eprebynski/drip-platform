import {
  DatasetSchema,
  DatasetType,
  validateSchema
} from "../../shared/src/index.js";
import { makeId, nowIso } from "./local-utils.js";

// TODO(Production): Connect Cloud Storage/BigQuery only after dataset production-load approval owners are confirmed.
export function validateDatasetType(datasetType) {
  const valid = Object.values(DatasetType).includes(datasetType);
  return {
    valid,
    errors: valid ? [] : [`Unsupported datasetType: ${datasetType}`]
  };
}

export function createDatasetMetadataDraft(input = {}) {
  const now = nowIso();
  return {
    datasetId: input.datasetId ?? makeId("dataset", input.datasetType ?? "custom"),
    datasetName: input.datasetName ?? "Draft dataset",
    datasetType: input.datasetType ?? DatasetType.CUSTOM,
    sourceType: input.sourceType ?? "local_mock",
    uploadedBy: input.uploadedBy ?? "local_admin",
    storagePath: input.storagePath ?? "local://dataset/mock.csv",
    originalFilename: input.originalFilename ?? "mock.csv",
    fileHash: input.fileHash ?? "sha256:local-mock",
    schemaStatus: "PENDING",
    validationStatus: "PENDING",
    ingestionStatus: "DRY_RUN_ONLY",
    targetBigQueryDataset: input.targetBigQueryDataset ?? "drip_raw",
    targetBigQueryTable: input.targetBigQueryTable ?? "raw_dataset_uploads",
    sourceFreshnessDate: input.sourceFreshnessDate,
    dataQualityWarnings: input.dataQualityWarnings ?? [],
    notes: input.notes ?? "Local metadata draft only.",
    createdAt: now,
    updatedAt: now
  };
}

export function validateRequiredMetadata(dataset) {
  const typeResult = validateDatasetType(dataset.datasetType);
  const schemaResult = validateSchema(DatasetSchema, dataset);
  return {
    valid: typeResult.valid && schemaResult.valid,
    errors: [...typeResult.errors, ...schemaResult.errors]
  };
}

export function createDryRunBigQueryLoadPlan(dataset) {
  const validation = validateRequiredMetadata(dataset);
  return {
    dryRun: true,
    datasetId: dataset.datasetId,
    targetBigQueryDataset: dataset.targetBigQueryDataset,
    targetBigQueryTable: dataset.targetBigQueryTable,
    validation,
    steps: [
      "validate metadata",
      "infer schema",
      "stage local load plan",
      "require production-load approval before live BigQuery"
    ]
  };
}

export function createDataQualityWarningObject(input = {}) {
  return {
    warningId: makeId("quality_warning", input.datasetId ?? "dataset"),
    datasetId: input.datasetId,
    severity: input.severity ?? "LOW",
    message: input.message ?? "Local mock warning",
    createdAt: nowIso()
  };
}
