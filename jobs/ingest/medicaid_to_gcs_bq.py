#!/usr/bin/env python3
"""Minimal helper to upload a local Medicaid CSV to GCS and load into BigQuery.

Safe default is dry-run to avoid accidental uploads.
"""

import argparse
import subprocess
from pathlib import Path


def run(cmd: list[str], dry_run: bool) -> None:
    print("$", " ".join(cmd))
    if not dry_run:
        subprocess.run(cmd, check=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project_id", required=True)
    parser.add_argument("--csv", required=True)
    parser.add_argument("--table", default="drip_raw.medicaid_claims")
    parser.add_argument("--dry_run", action="store_true", default=True)
    parser.add_argument("--execute", action="store_true", help="Disable dry-run and execute commands")
    args = parser.parse_args()

    csv_path = Path(args.csv).expanduser().resolve()
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    dry_run = args.dry_run and not args.execute

    bucket_uri = f"gs://{args.project_id}-drip-raw/{csv_path.name}"
    run(["gcloud", "storage", "cp", str(csv_path), bucket_uri], dry_run=dry_run)
    run(
        [
            "bq",
            "load",
            "--autodetect",
            "--source_format=CSV",
            args.table,
            bucket_uri,
        ],
        dry_run=dry_run,
    )


if __name__ == "__main__":
    main()
