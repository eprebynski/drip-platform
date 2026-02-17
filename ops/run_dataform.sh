#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <PROJECT_ID> [DATAFORM_REPO] [WORKSPACE]"
  exit 1
fi

PROJECT_ID="$1"
DATAFORM_REPO="${2:-drip-dataform}"
WORKSPACE="${3:-main}"

cat <<MSG
Run Dataform workflow invocation (adjust release config/workflow config names as needed):

gcloud dataform workflow-invocations create \
  --project="${PROJECT_ID}" \
  --location=us-east1 \
  --repository="${DATAFORM_REPO}" \
  --workflow-config="${WORKSPACE}"

Alternatively use Dataform UI to compile with vars.project_id=${PROJECT_ID}.
MSG
