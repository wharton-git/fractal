# Déployer avec Kustomize

## 1. Quand utiliser ce guide

Ce guide s'applique si le projet contient déjà :

- un dossier `k8s/`
- un fichier `kustomization.yaml`
- des manifests prêts à être appliqués

Commande centrale :

```bash
kubectl apply -k k8s/
```

---

## 2. Rôle de `kustomization.yaml`

Kustomize permet de :

- déclarer une liste de ressources
- injecter un namespace commun
- structurer proprement un déploiement versionné

En pratique, si le namespace est déjà défini dans `kustomization.yaml` ou dans les manifests :

- l'ajout de `-n "${NAMESPACE}"` n'est pas indispensable
- l'application directe avec `kubectl apply -k` est généralement préférable

---

## 3. Vérifier que Kustomize est réellement utilisé dans le projet

Vérification simple :

```bash
ls k8s/kustomization.yaml
```

Puis :

```bash
kubectl apply -k k8s/
```

Si cette commande échoue avec une erreur liée à l'absence de `kustomization.yaml`, le guide à utiliser devient :

- [Déployer avec des YAML sans Kustomize](./kubectl-yaml.md)

---

## 4. Vérifications après application

Commandes utiles :

```bash
kubectl get all -n "${NAMESPACE}"
kubectl get configmap -n "${NAMESPACE}"
kubectl get hpa -n "${NAMESPACE}"
kubectl get pdb -n "${NAMESPACE}"
```

Suivi du rollout :

```bash
kubectl rollout status deployment/backend -n "${NAMESPACE}"
kubectl rollout status deployment/frontend -n "${NAMESPACE}"
```

Lecture ciblée des déploiements :

```bash
kubectl describe deployment backend -n "${NAMESPACE}"
kubectl describe deployment frontend -n "${NAMESPACE}"
```

---

## 5. Cas fréquent : nouvelle image non reprise par les pods

Les vérifications prioritaires sont :

- le tag utilisé
- le champ `image` dans les `Deployment`
- la politique `imagePullPolicy`

Redémarrage explicite si nécessaire :

```bash
kubectl rollout restart deployment/backend -n "${NAMESPACE}"
kubectl rollout restart deployment/frontend -n "${NAMESPACE}"
```

Recommandation :

- préférer des tags versionnés
- éviter de dépendre exclusivement de `latest`

---

## 6. Exemple pour ce projet

Le dépôt utilise réellement Kustomize via `k8s/kustomization.yaml`.

Ressources réellement incluses :

- `namespace.yaml`
- `backend-configmap.yaml`
- `backend-deployment.yaml`
- `backend-service.yaml`
- `backend-hpa.yaml`
- `backend-pdb.yaml`
- `frontend-configmap.yaml`
- `frontend-deployment.yaml`
- `frontend-service.yaml`

Remarque importante :

- `k8s/ingress-example.yaml` existe, mais **n'est pas inclus** dans `k8s/kustomization.yaml`

Namespace réel :

- `cloud-scaling-demo`

Ressources réelles créées par défaut :

- `Deployment/backend`
- `Service/backend-service`
- `HorizontalPodAutoscaler/backend-hpa`
- `PodDisruptionBudget/backend-pdb`
- `Deployment/frontend`
- `Service/frontend-service`

Application :

```bash
kubectl apply -k k8s/
```

Vérification :

```bash
kubectl get deployment backend frontend -n cloud-scaling-demo
kubectl get svc backend-service frontend-service -n cloud-scaling-demo
kubectl get hpa backend-hpa -n cloud-scaling-demo
kubectl get pdb backend-pdb -n cloud-scaling-demo
```

Points techniques réels du projet :

- backend : `ClusterIP`, port `6543`
- frontend : `LoadBalancer`, port `80`
- backend readiness probe : `/api/ready`
- backend liveness probe : `/api/health`
- frontend readiness/liveness probe : `/healthz`

Point de vigilance spécifique au dépôt :

- les `Deployment` backend et frontend référencent actuellement des images hébergées dans un projet GCP précis
- avant un déploiement dans un autre projet, les champs `image` doivent être adaptés
