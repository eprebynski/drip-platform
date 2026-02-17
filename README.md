# Drip Core Intelligence Layer Scaffold (GCP)

Minimal, shippable scaffold for Drip's provider targeting intelligence stack on GCP, optimized for fast GTM with Medicaid now and Medicare drop-in later.

## Architecture principles

- **No patient-level storage**: all utilization is normalized at `provider + market + period_start + procedure_group` grain.
- **Targeting-ready marts**: geo, specialty, influence, and procedure mix are combined in `drip_marts.targetable_providers`.
- **Extensible source model**: raw-source-specific mappers feed one canonical `drip_core.utilization_events` with `payer_source`.

## Repo layout

- `infra/terraform/`: infrastructure as code (buckets, BQ datasets, Artifact Registry, Cloud Run).
- `dataform/`: canonical BigQuery models and source mappings.
- `jobs/ingest/`: optional local-to-GCS-to-BQ helpers (safe dry-run default).
- `services/segment-api/`: FastAPI service for segment preview/create/list.
- `ops/`: operational scripts (Dataform invocation helper).
- `cloudbuild.yaml`: CI/CD pipeline for segment API build + deploy.

## Prerequisites

In Cloud Shell:

```bash
export PROJECT_ID="your-project-id"
export REGION="us-east1"
gcloud config set project "$PROJECT_ID"
```

Enable required APIs:

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  bigquery.googleapis.com \
  cloudbuild.googleapis.com \
  storage.googleapis.com \
  dataform.googleapis.com
```

## Deploy infra with Terraform

```bash
cd infra/terraform
terraform init
terraform apply -var="project_id=${PROJECT_ID}" -var="region=${REGION}" -var="bq_location=US"
```

This provisions:

- GCS buckets: `${PROJECT_ID}-drip-raw`, `${PROJECT_ID}-drip-staged`, `${PROJECT_ID}-drip-artifacts`
- BigQuery datasets: `drip_raw`, `drip_core`, `drip_marts`
- Artifact Registry repo: `drip` (us-east1)
- Cloud Run service: `drip-segment-api` (us-east1)

## Dataform setup + runs

1. Update `dataform/dataform.json` `defaultDatabase` and `vars.project_id` to your project ID.
2. Install dependencies and compile locally (optional):

```bash
cd dataform
npm install
npx dataform compile
```

3. Run via Dataform UI or CLI workflow invocation helper:

```bash
cd /workspace/drip-platform
./ops/run_dataform.sh "$PROJECT_ID"
```

## Cloud Build CI/CD

`cloudbuild.yaml` builds and deploys `services/segment-api`.

Manual run:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

Set trigger on `main`:

1. Cloud Build → Triggers → Create Trigger
2. Event: push to branch `^main$`
3. Config: `cloudbuild.yaml`
4. Service account needs roles for Artifact Registry and Cloud Run deploy.

## Segment API

Endpoints:

- `GET /healthz`
- `POST /segments/preview` (non-persistent, aggregate preview)
- `POST /segments/create` (persists to `drip_marts.segments` + `drip_marts.segment_membership`)
- `GET /segments/{segment_id}/providers?page=1&page_size=100`

### Run locally

```bash
cd services/segment-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GOOGLE_CLOUD_PROJECT="$PROJECT_ID"
export BQ_MARTS_DATASET="drip_marts"
uvicorn main:app --reload --port 8080
```

Test locally:

```bash
curl http://localhost:8080/healthz
curl -X POST http://localhost:8080/segments/preview \
  -H 'Content-Type: application/json' \
  -d '{"definition":{"name":"NY cardio","states":["NY"],"specialties":["cardiology"],"min_influence_score":0.2}}'
```

### Test in Cloud Run

```bash
SERVICE_URL=$(gcloud run services describe drip-segment-api --region "$REGION" --format='value(status.url)')
curl "$SERVICE_URL/healthz"
```

## Loading Medicaid raw data

Dry-run helper:

```bash
python jobs/ingest/medicaid_to_gcs_bq.py --project_id "$PROJECT_ID" --csv ./medicaid_claims.csv
```

Execute upload/load:

```bash
python jobs/ingest/medicaid_to_gcs_bq.py --project_id "$PROJECT_ID" --csv ./medicaid_claims.csv --execute
```

## Add Medicare later (drop-in)

1. Load raw Medicare data into `drip_raw.medicare_claims` (or equivalent `drip_raw.medicare_*`).
2. Edit `dataform/definitions/mappings/utilization_events_medicare_placeholder.sqlx`:
   - set `disabled: false`
   - align source columns to mapper select.
3. Set `vars.enable_medicare` to `"true"` in `dataform/dataform.json` (or equivalent Dataform release/workflow config var).
4. Run Dataform.
5. No API/schema refactor required because downstream uses canonical `drip_core.utilization_events` with `payer_source`.
