output "artifact_registry_repo" {
  value = google_artifact_registry_repository.drip.name
}

output "segment_api_uri" {
  value = google_cloud_run_v2_service.segment_api.uri
}

output "raw_bucket" {
  value = "${var.project_id}-drip-raw"
}
