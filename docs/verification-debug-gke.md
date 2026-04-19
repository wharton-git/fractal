# Vérification, debug et opérations

## 1. Vérifier les ressources de base

Commandes génériques :

```bash
kubectl get pods -n "${NAMESPACE}"
kubectl get svc -n "${NAMESPACE}"
kubectl get deployments -n "${NAMESPACE}"
```

Suivi du rollout :

```bash
kubectl rollout status deployment/backend -n "${NAMESPACE}"
kubectl rollout status deployment/frontend -n "${NAMESPACE}"
```

---

## 2. Lire les logs et entrer dans un pod

Pour éviter les ambiguïtés entre `Deployment` et `Pod`, la méthode la plus portable consiste à cibler un pod réel.

Exemple :

```bash
FRONTEND_POD="$(kubectl get pod -n "${NAMESPACE}" -l app=frontend -o jsonpath='{.items[0].metadata.name}')"
BACKEND_POD="$(kubectl get pod -n "${NAMESPACE}" -l app=backend -o jsonpath='{.items[0].metadata.name}')"
```

Logs :

```bash
kubectl logs -n "${NAMESPACE}" "${FRONTEND_POD}"
kubectl logs -n "${NAMESPACE}" "${BACKEND_POD}"
```

Shell dans le pod frontend :

```bash
kubectl exec -it -n "${NAMESPACE}" "${FRONTEND_POD}" -- sh
```

---

## 3. Vérifier les probes

Les probes doivent être distinguées des endpoints publics fonctionnels.

### Vérification générique

Les points à contrôler sont :

- l'URL de `readinessProbe`
- l'URL de `livenessProbe`
- le port du conteneur associé

Exemple de lecture :

```bash
kubectl describe deployment backend -n "${NAMESPACE}"
kubectl describe deployment frontend -n "${NAMESPACE}"
```

### Exemple pour ce projet

Valeurs réelles observées :

- backend readiness probe : `/api/ready`
- backend liveness probe : `/api/health`
- frontend readiness probe : `/healthz`
- frontend liveness probe : `/healthz`

Ports réels :

- backend : `6543`
- frontend : `80`

---

## 4. Vérifier la communication interne entre services

Convention DNS Kubernetes :

```text
http://<service-name>.<namespace>.svc.cluster.local:<port>
```

Pour un test interne générique :

```bash
kubectl -n "${NAMESPACE}" run curlbox \
  --rm -it \
  --image=curlimages/curl \
  --restart=Never \
  -- sh
```

Puis, dans le pod temporaire :

```bash
curl "http://<service-name>.${NAMESPACE}.svc.cluster.local:<port>/<health-endpoint>"
```

Remarque :

- l'endpoint doit correspondre à l'application réelle
- selon les projets, il peut s'agir de `/health`, `/ready`, `/status` ou `/api/health`

### Exemple pour ce projet

DNS interne réel :

```text
http://backend-service.cloud-scaling-demo.svc.cluster.local:6543
```

Test réel :

```bash
curl http://backend-service.cloud-scaling-demo.svc.cluster.local:6543/api/health
curl http://backend-service.cloud-scaling-demo.svc.cluster.local:6543/api/ready
curl http://backend-service.cloud-scaling-demo.svc.cluster.local:6543/api/status
```

---

## 5. Clarifier ClusterIP, LoadBalancer, Ingress et port-forward

### `ClusterIP`

- service accessible uniquement depuis le cluster
- adapté à un backend interne

### `LoadBalancer`

- service exposé publiquement via l'infrastructure cloud
- adapté à un frontend ou à une API publique

### `Ingress`

- point d'entrée HTTP optionnel
- adapté à un domaine, plusieurs routes ou une exposition plus structurée

### `port-forward`

- accès local temporaire à un service non exposé
- utile pour tester une API interne depuis la machine locale

---

## 6. Vérifier l'exposition réseau

Services :

```bash
kubectl get svc -n "${NAMESPACE}"
```

Si un Ingress existe :

```bash
kubectl get ingress -n "${NAMESPACE}"
```

Pour inspecter un service :

```bash
kubectl describe svc frontend-service -n "${NAMESPACE}"
kubectl describe svc backend-service -n "${NAMESPACE}"
```

### Exemple pour ce projet

Exposition réelle du dépôt :

- `frontend-service` : `LoadBalancer`
- `backend-service` : `ClusterIP`

Conséquence :

- un appel direct au backend depuis le navigateur ou depuis la machine locale n'est pas possible sans `port-forward` ou sans accès depuis le cluster
- le frontend peut, lui, être exposé publiquement

Le fichier `k8s/ingress-example.yaml` existe, mais il n'est pas inclus dans le déploiement Kustomize par défaut.

---

## 7. Utiliser `port-forward`

### Exemple générique

```bash
kubectl -n "${NAMESPACE}" port-forward svc/<service-name> <local-port>:<service-port>
```

### Exemple pour ce projet

Backend interne :

```bash
kubectl -n cloud-scaling-demo port-forward svc/backend-service 6543:6543
```

Puis :

```bash
curl http://127.0.0.1:6543/api/health
curl http://127.0.0.1:6543/api/ready
curl http://127.0.0.1:6543/api/status
```

Frontend :

```bash
kubectl -n cloud-scaling-demo port-forward svc/frontend-service 8080:80
```

Puis :

```bash
curl http://127.0.0.1:8080/
curl http://127.0.0.1:8080/api/health
```

---

## 8. Tester la charge

### Cas générique

Avant d'utiliser `ab`, deux questions doivent être tranchées :

- le backend est-il publiquement exposé ?
- le test doit-il viser le backend directement ou passer par le frontend proxy ?

### Si le backend est publiquement exposé

```bash
ab -n 100 -c 10 http://<BACKEND_URL>/<health-endpoint>
```

### Si le backend est privé

Deux approches sont raisonnables :

- `port-forward`
- exécution depuis un pod interne au cluster

### Exemple pour ce projet

Le backend réel est privé (`ClusterIP`), donc un test direct depuis la machine locale nécessite un `port-forward`.

Exemple :

```bash
kubectl -n cloud-scaling-demo port-forward svc/backend-service 6543:6543
ab -n 100 -c 10 http://127.0.0.1:6543/api/health
ab -n 600 -c 40 "http://127.0.0.1:6543/api/load/latency?delay=1200"
ab -n 1200 -c 120 "http://127.0.0.1:6543/api/load/cpu?duration=5000&intensity=high"
```

Si le frontend public doit être testé de bout en bout :

```bash
ab -n 100 -c 10 http://<FRONTEND_URL>/api/health
```

Dans ce cas, le trafic traverse :

1. le `LoadBalancer` du frontend
2. Nginx frontend
3. le proxy `/api/`
4. `backend-service`

---

## 9. HPA et haute disponibilité

Les commandes suivantes n'ont de sens que si un `HorizontalPodAutoscaler` existe réellement.

Commandes génériques :

```bash
kubectl get hpa -n "${NAMESPACE}"
kubectl describe hpa -n "${NAMESPACE}"
kubectl get pods -n "${NAMESPACE}" -w
```

Si la métrique CPU doit être observée :

```bash
kubectl top pods -n "${NAMESPACE}"
```

Remarque :

- `kubectl top` dépend de la disponibilité des métriques dans le cluster

### Exemple pour ce projet

Le dépôt contient réellement un HPA :

- `backend-hpa`

Commande :

```bash
kubectl get hpa backend-hpa -n cloud-scaling-demo
kubectl describe hpa backend-hpa -n cloud-scaling-demo
kubectl get pods -n cloud-scaling-demo -w
kubectl top pods -n cloud-scaling-demo
```

Ressource surveillée :

- `Deployment/backend`

Seuil CPU configuré :

- `averageUtilization: 65`

---

## 10. Mettre à jour une application déjà déployée

Commande générique :

```bash
kubectl set image deployment/backend \
  backend="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:v2" \
  -n "${NAMESPACE}"

kubectl set image deployment/frontend \
  frontend="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:v2" \
  -n "${NAMESPACE}"
```

Puis :

```bash
kubectl rollout status deployment/backend -n "${NAMESPACE}"
kubectl rollout status deployment/frontend -n "${NAMESPACE}"
```

Si le même tag est réutilisé :

```bash
kubectl rollout restart deployment/backend -n "${NAMESPACE}"
kubectl rollout restart deployment/frontend -n "${NAMESPACE}"
```

Recommandation :

- préférer des tags versionnés à `latest`

### Exemple pour ce projet

Le dépôt réel utilise actuellement `latest` dans les manifests Kubernetes.

Ce point augmente le risque de confusion avec :

- `imagePullPolicy: IfNotPresent`
- des images locales non rafraîchies
- des rollouts qui ne changent pas d'image de façon explicite

Le schéma recommandé reste :

- construire une nouvelle image taguée
- pousser cette image
- mettre à jour le champ `image`
- suivre le rollout

---

## 11. Erreurs fréquentes

### `kubectl apply -k` échoue

Cause fréquente :

- absence de `kustomization.yaml`

Alternative :

```bash
kubectl apply -f k8s/
```

### `ImagePullBackOff` ou `ErrImagePull`

Vérifier :

- le chemin exact de l'image
- le projet GCP
- le tag
- les permissions Artifact Registry

### Backend inaccessible depuis la machine locale

Ce comportement peut être normal si le service est en `ClusterIP`.

Solutions :

- `port-forward`
- test depuis un pod interne
- exposition volontaire du backend

### Pas d'IP externe sur le `LoadBalancer`

Vérifier :

```bash
kubectl get svc -n "${NAMESPACE}"
kubectl describe svc frontend-service -n "${NAMESPACE}"
```

### Communication interne défaillante

Vérifier :

- nom exact du `Service`
- namespace
- port
- endpoint attendu
- configuration du proxy frontend

Commandes utiles :

```bash
kubectl get svc -n "${NAMESPACE}"
kubectl get endpoints -n "${NAMESPACE}"
```

---

## 12. Exemple synthétique pour ce projet

Vérification rapide des ressources :

```bash
kubectl get deployment backend frontend -n cloud-scaling-demo
kubectl get svc backend-service frontend-service -n cloud-scaling-demo
kubectl get hpa backend-hpa -n cloud-scaling-demo
kubectl get pdb backend-pdb -n cloud-scaling-demo
```

Backend :

- interne au cluster
- port `6543`
- endpoints de probe et de test sous `/api/*`

Frontend :

- exposé via `frontend-service`
- port `80` dans Kubernetes
- endpoint de probe `/healthz`
- proxy `/api/` vers le backend interne
