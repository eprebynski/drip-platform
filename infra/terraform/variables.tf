variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "Primary region for regional resources"
  type        = string
  default     = "us-east1"
}

variable "bq_location" {
  description = "BigQuery dataset location"
  type        = string
  default     = "US"
}

variable "segment_api_image" {
  description = "Container image for drip-segment-api"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}
