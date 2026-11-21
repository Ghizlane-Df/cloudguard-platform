resource "kubernetes_deployment_v1" "backend" {
  metadata {
    name      = "backend"
    namespace = "cloudguard"
  }
  wait_for_rollout = true
  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend"
        }
      }

      spec {
        automount_service_account_token = true
        service_account_name            = "cloudguard-backend"
        enable_service_links            = false

        security_context {
          run_as_group    = 10001
          run_as_non_root = true
          run_as_user     = 10001

          seccomp_profile {
            type = "RuntimeDefault"
          }
        }

        container {
          name              = "backend"
          image             = "cloudguard-backend:v5"
          image_pull_policy = "Never"

          port {
            container_port = 5000
            protocol       = "TCP"
          }

          env {
            name  = "DB_HOST"
            value = "postgres"
          }

          env {
            name  = "DB_PORT"
            value = "5432"
          }

          env {
            name  = "DB_NAME"
            value = "cloudguard"
          }

          env {
            name  = "DB_USER"
            value = "cloudguard"
          }

          env {
            name  = "FLASK_DEBUG"
            value = "false"
          }

          env {
            name = "SECRET_KEY"

            value_from {
              secret_key_ref {
                name = "cloudguard-app-secret"
                key  = "SECRET_KEY"
              }
            }
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }

            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          security_context {
            allow_privilege_escalation = false

            capabilities {
              drop = ["ALL"]
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "backend" {
  metadata {
    name      = "backend"
    namespace = "cloudguard"
  }
  wait_for_load_balancer = true
  spec {
    selector = {
      app = "backend"
    }

    port {
      port        = 5000
      target_port = "5000"
      protocol    = "TCP"
    }

    type = "ClusterIP"
  }
}
