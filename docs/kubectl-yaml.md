# Déployer avec des YAML sans Kustomize

## 1. Quand utiliser ce guide

Ce guide s'applique si :

- des manifests Kubernetes existent déjà
- aucun `kustomization.yaml` n'est utilisé
- l'application doit être déployée directement avec `kubectl apply -f`

Commande centrale :

```bash
kubectl apply -f k8s/
```

---

## 2. Namespace et portée de la commande

Deux cas doivent être distingués :

- le namespace est déjà défini dans les fichiers YAML
- le namespace n'est pas défini dans les fichiers YAML

Si le namespace est déjà codé dans les manifests :

- `kubectl apply -f` suffit généralement

Si le namespace n'est pas codé dans les manifests :

- utiliser `-n "${NAMESPACE}"` ou créer d'abord le namespace cible

---

## 3. Application d'un dossier complet

Commande :

```bash
kubectl apply -f k8s/
```

Cette méthode convient lorsque :

- l'ordre entre les fichiers n'est pas critique
- le namespace existe déjà ou fait partie du dossier

---

## 4. Application fichier par fichier

Cette méthode est utile lorsque l'ordre doit être explicite.

Exemple générique :

```bash
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

Ordre recommandé :

1. namespace
2. configmaps et secrets
3. deployments
4. services
5. ressources optionnelles comme HPA, PDB, Ingress

---

## 5. Vérifications après application

```bash
kubectl get pods -n "${NAMESPACE}"
kubectl get svc -n "${NAMESPACE}"
kubectl get deployments -n "${NAMESPACE}"
```

Puis :

```bash
kubectl rollout status deployment/backend -n "${NAMESPACE}"
kubectl rollout status deployment/frontend -n "${NAMESPACE}"
```

---

## 6. Exemple pour ce projet

Le dépôt contient des manifests YAML complets. Même si le chemin recommandé reste Kustomize, une application fichier par fichier est possible.

Namespace réel :

- `cloud-scaling-demo`

Ordre réaliste d'application pour ce dépôt :

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-hpa.yaml
kubectl apply -f k8s/backend-pdb.yaml
kubectl apply -f k8s/frontend-configmap.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

Si un Ingress est souhaité :

```bash
kubectl apply -f k8s/ingress-example.yaml
```

Remarque :

- le fichier `ingress-example.yaml` demande une adaptation du `host`

Vérification :

```bash
kubectl get deployment backend frontend -n cloud-scaling-demo
kubectl get svc backend-service frontend-service -n cloud-scaling-demo
kubectl get hpa backend-hpa -n cloud-scaling-demo
```

Points techniques réels :

- `backend-service` est en `ClusterIP`
- `frontend-service` est en `LoadBalancer`
- le frontend appelle le backend via `backend-service.cloud-scaling-demo.svc.cluster.local:6543`

Point de vigilance spécifique au dépôt :

- les références d'images des `Deployment` sont actuellement hardcodées vers un projet GCP précis
- pour un autre projet, les champs `image` doivent être remplacés avant application
