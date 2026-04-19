# GKE Standard

## 1. Quand utiliser ce guide

Ce guide s'applique lorsqu'un cluster **GKE Standard** est recherché.

Ce mode convient lorsque davantage de contrôle est nécessaire sur :

- le nombre de nœuds
- la taille des machines
- le choix entre cluster régional et cluster zonal
- certaines contraintes non adaptées à Autopilot

---

## 2. Cluster Standard régional

Commande de référence :

```bash
gcloud container clusters create "${CLUSTER_NAME}" \
  --region "${REGION}" \
  --num-nodes 2 \
  --machine-type e2-standard-2 \
  --release-channel regular
```

Explication :

- `--region` crée un cluster régional
- `--num-nodes 2` signifie généralement 2 nœuds par zone dans le node pool par défaut
- `--machine-type e2-standard-2` définit la taille des nœuds
- `--release-channel regular` sélectionne un canal de mises à jour stable

Remarque importante :

- dans un cluster régional Standard, `--num-nodes` s'interprète généralement **par zone**
- avec trois zones et `--num-nodes 2`, le total peut atteindre 6 nœuds

Ce mode est approprié si :

- une meilleure tolérance aux pannes de zone est recherchée
- le contrôle sur les nœuds reste souhaité

---

## 3. Cluster Standard zonal

Commande de référence :

```bash
gcloud container clusters create "${CLUSTER_NAME}" \
  --zone "${ZONE}" \
  --num-nodes 3 \
  --machine-type e2-standard-2 \
  --release-channel regular
```

Explication :

- `--zone` crée un cluster dans une seule zone
- `--num-nodes 3` crée 3 nœuds dans cette zone
- cette approche est plus simple, mais moins tolérante à une panne de zone qu'un cluster régional

Ce mode est souvent réservé à :

- un environnement de test
- un besoin de coût réduit
- un besoin limité en haute disponibilité multi-zone

---

## 4. Récupérer les credentials Kubernetes

### Cluster régional

```bash
gcloud container clusters get-credentials "${CLUSTER_NAME}" \
  --region "${REGION}"
```

### Cluster zonal

```bash
gcloud container clusters get-credentials "${CLUSTER_NAME}" \
  --zone "${ZONE}"
```

Vérification :

```bash
kubectl config current-context
kubectl get nodes
```

---

## 5. Points d'attention en Standard

Les points suivants méritent une vérification particulière :

- le compte utilisé pour pousser les images vers Artifact Registry
- le compte ou service account utilisé par GKE pour tirer les images
- le dimensionnement réel des nœuds et des requests/limits
- la différence entre cluster régional et zonal

En cas d'échec de pull d'image :

- vérifier le chemin exact de l'image
- vérifier le tag
- vérifier les permissions Artifact Registry
- vérifier si les images sont hébergées dans le même projet que le cluster

---

## 6. Déploiement de l'application après création du cluster

Une fois le cluster prêt, le guide à suivre dépend du mode de packaging Kubernetes :

- [Déployer avec Kustomize](./kubectl-kustomize.md)
- [Déployer avec des YAML sans Kustomize](./kubectl-yaml.md)
- [Créer les manifests et déployer depuis zéro](./kubernetes-from-scratch.md)

Puis :

- [Vérification, debug et opérations](./verification-debug-gke.md)

---

## 7. Exemple pour ce projet

Exemple Standard régional :

```bash
export PROJECT_ID="ton-project-id"
export REGION="europe-west1"
export CLUSTER_NAME="cloud-scaling-demo"

gcloud config set project "${PROJECT_ID}"

gcloud container clusters create "${CLUSTER_NAME}" \
  --region "${REGION}" \
  --num-nodes 2 \
  --machine-type e2-standard-2 \
  --release-channel regular

gcloud container clusters get-credentials "${CLUSTER_NAME}" \
  --region "${REGION}"
```

Déploiement :

```bash
kubectl apply -k k8s/
```

Point de vigilance spécifique au dépôt :

- les manifests Kubernetes actuels ciblent des images `latest` dans un projet GCP précis
- pour un autre projet, les champs `image` doivent être modifiés avant application
