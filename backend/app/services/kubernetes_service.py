
from kubernetes import client, config
from kubernetes.config.config_exception import ConfigException


def get_kubernetes_client():
    """
    Initialise la connexion Kubernetes.
    - Dans Minikube/Windows : utilise le fichier kubeconfig.
    - Dans Kubernetes : utilise les permissions du Pod.
    """

    try:
        config.load_incluster_config()
    except ConfigException:
        config.load_kube_config()

    return client.CoreV1Api(), client.AppsV1Api()


def get_cluster_resources():
    """
    Récupère les Nodes, Pods et Namespaces du cluster.
    """

    core_api, apps_api = get_kubernetes_client()

    nodes = core_api.list_node().items
    pods = core_api.list_pod_for_all_namespaces().items
    namespaces = core_api.list_namespace().items
    deployments = apps_api.list_deployment_for_all_namespaces().items

    return {
        "nodes": [
            {
                "name": node.metadata.name,
                "status": next(
                    (
                        condition.type
                        for condition in node.status.conditions or []
                        if condition.type == "Ready"
                        and condition.status == "True"
                    ),
                    "NotReady"
                )
            }
            for node in nodes
        ],
        "pods": [
            {
                "name": pod.metadata.name,
                "namespace": pod.metadata.namespace,
                "status": pod.status.phase or "Unknown"
            }
            for pod in pods
        ],
        "namespaces": [
            namespace.metadata.name
            for namespace in namespaces
        ],
        "deployments": [
            {
                "name": deployment.metadata.name,
                "namespace": deployment.metadata.namespace,
                "replicas": deployment.spec.replicas or 0,
                "ready_replicas": deployment.status.ready_replicas or 0
            }
            for deployment in deployments
        ]
    }
