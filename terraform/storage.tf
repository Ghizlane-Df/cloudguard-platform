
resource "kubernetes_persistent_volume_claim_v1" "postgres" {
  metadata {
    name      = "postgres-pvc"
    namespace = "cloudguard"
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "2Gi"
      }
    }

    storage_class_name = "standard"
    volume_mode        = "Filesystem"
  }

  lifecycle {
    prevent_destroy = true
  }
}
