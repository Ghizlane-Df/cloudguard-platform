terraform {
  required_version = ">= 1.5.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.35"
    }
  }
}

provider "kubernetes" {
  config_path    = pathexpand("~/.kube/config")
  config_context = "minikube"
}

resource "kubernetes_namespace_v1" "cloudguard" {
  metadata {
    name = "cloudguard"

    labels = {
      app         = "cloudguard"
      environment = "development"
    }
  }
}

output "cloudguard_namespace" {
  value = kubernetes_namespace_v1.cloudguard.metadata[0].name
}