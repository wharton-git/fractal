# GKE Autopilot

## 1. Quand utiliser ce guide

Ce guide s'applique lorsqu'un cluster **GKE Autopilot** est recherché.

Ce mode est généralement adapté dans les situations suivantes :

- besoin de déploiement rapide
- volonté de limiter l'administration des nœuds
- charge applicative standard, sans besoins privilégiés sur l'hôte

---

## 2. Créer le cluster

Commande recommandée :

```bash
gcloud container clusters create-auto "${CLUSTER_NAME}" \
  --region "${REGION}"
```

Explication :

- `create-auto` crée un cluster GKE en mode Autopilot
- `--region` crée un cluster régional
- la gestion des nœuds est largement prise en charge par GKE

Vérification :

```bash
gcloud container clusters get-credentials "${CLUSTER_NAME}" \
  --region "${REGION}"

kubectl config current-context
kubectl get nodes
```

---

## 3. Restrictions à garder en tête

Autopilot applique des contraintes supplémentaires sur certains workloads.

Points de vigilance fréquents :

- certains workloads privilégiés sont rejetés
- l'accès au niveau du nœud n'est pas un scénario pris en charge
- certaines configurations très basses couches nécessitent un cluster Standard

En pratique, Autopilot convient bien à :

- des `Deployment`
- des `Service`
- des `ConfigMap`
- des workloads HTTP stateless
- un `HPA`
- un `PodDisruptionBudget`

---

## 4. Compatibilité du projet réel avec Autopilot

Le dépôt actuel est compatible, sur le principe, avec un déploiement Autopilot :

- backend HTTP stateless
- frontend Nginx stateless
- ressources CPU/mémoire déclarées dans les manifests
- `Deployment`, `Service`, `ConfigMap`, `HorizontalPodAutoscaler`, `PodDisruptionBudget`

Points réels observés dans le repo :

- backend : port `6543`
- frontend : port `80`
- backend interne en `ClusterIP`
- frontend exposé en `LoadBalancer`

---

## 5. Déploiement de l'application après création du cluster

Une fois le cluster créé, le guide à suivre dépend du mode de packaging Kubernetes :

- [Déployer avec Kustomize](./kubectl-kustomize.md)
- [Déployer avec des YAML sans Kustomize](./kubectl-yaml.md)
- [Créer les manifests et déployer depuis zéro](./kubernetes-from-scratch.md)

Puis :

- [Vérification, debug et opérations](./verification-debug-gke.md)

---

## 6. Exemple pour ce projet

Variables typiques :

```bash
export PROJECT_ID="ton-project-id"
export REGION="europe-west1"
export CLUSTER_NAME="cloud-scaling-demo"

gcloud config set project "${PROJECT_ID}"
```

Création du cluster :

```bash
gcloud container clusters create-auto "${CLUSTER_NAME}" \
  --region "${REGION}"
```

Connexion de `kubectl` :

```bash
gcloud container clusters get-credentials "${CLUSTER_NAME}" \
  --region "${REGION}"
```

Déploiement du projet :

```bash
kubectl apply -k k8s/
```

Point de vigilance spécifique au dépôt :

- les manifests Kubernetes actuels référencent des images hardcodées dans un projet GCP précis
- ces références doivent être adaptées si le déploiement s'effectue dans un autre projet
