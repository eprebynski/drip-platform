# Dataform models

This project materializes canonical Drip core and mart tables in BigQuery with provider-market-time aggregated utilization facts.

## Medicare placeholder

`definitions/mappings/utilization_events_medicare_placeholder.sqlx` is disabled by default. To enable Medicare later:

1. Ingest data to `drip_raw.medicare_claims` (or point model at your raw Medicare table).
2. Change `disabled: true` to `disabled: false` in the placeholder model.
3. Set `vars.enable_medicare` to `"true"` in `dataform.json` (or Dataform release/workflow config vars).
4. Run Dataform.
