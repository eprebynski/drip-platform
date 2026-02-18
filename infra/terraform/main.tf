provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  buckets = toset([
    "${var.project_id}-drip-raw",
    "${var.project_id}-drip-staged",
    "${var.project_id}-drip-artifacts"
  ])
}

resource "google_storage_bucket" "drip" {
  for_each                    = local.buckets
  name                        = each.value
  location                    = "US"
  uniform_bucket_level_access = true
  force_destroy               = false
}

resource "google_bigquery_dataset" "drip_raw" {
  dataset_id                 = "drip_raw"
  location                   = var.bq_location
  delete_contents_on_destroy = false
}

resource "google_bigquery_dataset" "drip_core" {
  dataset_id                 = "drip_core"
  location                   = var.bq_location
  delete_contents_on_destroy = false
}

resource "google_bigquery_dataset" "drip_marts" {
  dataset_id                 = "drip_marts"
  location                   = var.bq_location
  delete_contents_on_destroy = false
}

resource "google_artifact_registry_repository" "drip" {
  location      = var.region
  repository_id = "drip"
  description   = "Container repository for Drip services"
  format        = "DOCKER"
}

resource "google_cloud_run_v2_service" "segment_api" {
  name     = "drip-segment-api"
  location = var.region

  template {
    containers {
      image = var.segment_api_image
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
      env {
        name  = "BQ_MARTS_DATASET"
        value = "drip_marts"
      }
    }
  }

  ingress = "INGRESS_TRAFFIC_ALL"
}

resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  location = google_cloud_run_v2_service.segment_api.location
  name     = google_cloud_run_v2_service.segment_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
