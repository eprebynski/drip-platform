import json
import os
import uuid
from datetime import datetime, timezone
from functools import lru_cache
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from google.cloud import bigquery
from pydantic import BaseModel, Field

app = FastAPI(title="Drip Segment API", version="0.1.1")

BQ_MARTS_DATASET = os.getenv("BQ_MARTS_DATASET", "drip_marts")


@lru_cache(maxsize=1)
def get_bq_client() -> bigquery.Client:
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT")
    return bigquery.Client(project=project_id) if project_id else bigquery.Client()


def table_ref(table_name: str) -> str:
    project_id = get_bq_client().project
    return f"`{project_id}.{BQ_MARTS_DATASET}.{table_name}`"


class SegmentDefinition(BaseModel):
    name: str = Field(min_length=1)
    states: list[str] = Field(default_factory=list)
    markets: list[str] = Field(default_factory=list)
    specialties: list[str] = Field(default_factory=list)
    min_influence_score: float | None = None
    procedure_groups: list[str] = Field(default_factory=list)
    min_procedure_share: float | None = None


class SegmentPreviewRequest(BaseModel):
    definition: SegmentDefinition


class SegmentCreateRequest(BaseModel):
    definition: SegmentDefinition


def build_filters(defn: SegmentDefinition) -> tuple[str, list[Any]]:
    clauses: list[str] = []
    params: list[Any] = []

    if defn.states:
        clauses.append("state IN UNNEST(@states)")
        params.append(bigquery.ArrayQueryParameter("states", "STRING", defn.states))
    if defn.markets:
        clauses.append("market IN UNNEST(@markets)")
        params.append(bigquery.ArrayQueryParameter("markets", "STRING", defn.markets))
    if defn.specialties:
        clauses.append("specialty_rollup IN UNNEST(@specialties)")
        params.append(bigquery.ArrayQueryParameter("specialties", "STRING", defn.specialties))
    if defn.min_influence_score is not None:
        clauses.append("influence_score >= @min_influence_score")
        params.append(
            bigquery.ScalarQueryParameter(
                "min_influence_score", "FLOAT64", defn.min_influence_score
            )
        )
    if defn.procedure_groups:
        clauses.append(
            "EXISTS (SELECT 1 FROM UNNEST(top_procedure_mix) m "
            "WHERE m.procedure_group IN UNNEST(@procedure_groups) "
            "AND (@min_procedure_share IS NULL OR m.procedure_share >= @min_procedure_share))"
        )
        params.append(
            bigquery.ArrayQueryParameter("procedure_groups", "STRING", defn.procedure_groups)
        )
        params.append(
            bigquery.ScalarQueryParameter(
                "min_procedure_share", "FLOAT64", defn.min_procedure_share
            )
        )

    where_sql = " AND ".join(clauses) if clauses else "TRUE"
    return where_sql, params


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/segments/preview")
def preview_segment(req: SegmentPreviewRequest) -> dict[str, Any]:
    where_sql, params = build_filters(req.definition)
    targetable_table = table_ref("targetable_providers")

    query = f"""
    WITH scoped AS (
      SELECT *
      FROM {targetable_table}
      WHERE {where_sql}
    ), specialty_counts AS (
      SELECT state, market, specialty_rollup, COUNT(DISTINCT npi) AS provider_count
      FROM scoped
      GROUP BY state, market, specialty_rollup
    )
    SELECT
      s.state,
      s.market,
      COUNT(DISTINCT s.npi) AS provider_count,
      ARRAY(
        SELECT specialty_rollup
        FROM specialty_counts c
        WHERE c.state = s.state AND c.market = s.market
        ORDER BY c.provider_count DESC
        LIMIT 5
      ) AS top_specialties
    FROM scoped s
    GROUP BY s.state, s.market
    ORDER BY provider_count DESC
    """

    job_config = bigquery.QueryJobConfig(query_parameters=params)
    rows = list(get_bq_client().query(query, job_config=job_config).result())
    return {
        "segment_name": req.definition.name,
        "rows": [
            {
                "state": r["state"],
                "market": r["market"],
                "provider_count": r["provider_count"],
                "top_specialties": r["top_specialties"],
            }
            for r in rows
        ],
    }


@app.post("/segments/create")
def create_segment(req: SegmentCreateRequest) -> dict[str, str]:
    where_sql, filter_params = build_filters(req.definition)
    segment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    definition_json = json.dumps(req.definition.model_dump())

    segments_table = table_ref("segments")
    segment_membership_table = table_ref("segment_membership")
    targetable_table = table_ref("targetable_providers")

    script = f"""
    BEGIN TRANSACTION;
      INSERT INTO {segments_table} (segment_id, name, definition_json, created_at, updated_at)
      VALUES (@segment_id, @name, PARSE_JSON(@definition_json), TIMESTAMP(@created_at), TIMESTAMP(@updated_at));

      INSERT INTO {segment_membership_table} (segment_id, npi)
      SELECT @segment_id, npi
      FROM {targetable_table}
      WHERE {where_sql};
    COMMIT TRANSACTION;
    """

    params = filter_params + [
        bigquery.ScalarQueryParameter("segment_id", "STRING", segment_id),
        bigquery.ScalarQueryParameter("name", "STRING", req.definition.name),
        bigquery.ScalarQueryParameter("definition_json", "STRING", definition_json),
        bigquery.ScalarQueryParameter("created_at", "STRING", now),
        bigquery.ScalarQueryParameter("updated_at", "STRING", now),
    ]

    get_bq_client().query(
        script,
        job_config=bigquery.QueryJobConfig(query_parameters=params),
    ).result()

    return {"segment_id": segment_id}


@app.get("/segments/{segment_id}/providers")
def list_segment_providers(
    segment_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=500),
) -> dict[str, Any]:
    offset = (page - 1) * page_size
    query = f"""
    SELECT
      m.npi,
      ANY_VALUE(t.provider_name) AS provider_name,
      ANY_VALUE(t.specialty_rollup) AS specialty_rollup,
      ANY_VALUE(t.state) AS state,
      ANY_VALUE(t.market) AS market,
      ANY_VALUE(t.influence_score) AS influence_score
    FROM {table_ref("segment_membership")} m
    LEFT JOIN {table_ref("targetable_providers")} t
      ON t.npi = m.npi
    WHERE m.segment_id = @segment_id
    GROUP BY m.npi
    ORDER BY m.npi
    LIMIT @page_size OFFSET @offset
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("segment_id", "STRING", segment_id),
            bigquery.ScalarQueryParameter("page_size", "INT64", page_size),
            bigquery.ScalarQueryParameter("offset", "INT64", offset),
        ]
    )
    rows = list(get_bq_client().query(query, job_config=job_config).result())
    if not rows and page == 1:
        raise HTTPException(status_code=404, detail="Segment not found or no members")

    return {
        "segment_id": segment_id,
        "page": page,
        "page_size": page_size,
        "providers": [dict(r.items()) for r in rows],
    }
