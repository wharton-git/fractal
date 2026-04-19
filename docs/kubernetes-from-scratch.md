# Créer les manifests et déployer depuis zéro

## 1. Quand utiliser ce guide

Ce guide s'applique lorsqu'aucun manifest Kubernetes n'existe encore.

Deux approches sont possibles :

- une approche rapide avec `kubectl create` et `kubectl expose`
- une approche versionnée avec des fichiers YAML

---

## 2. Option 1 : approche rapide avec `kubectl`

### 2.1 Variables utiles

Pour éviter les valeurs implicites, les ports et les noms de service peuvent être explicités :

```bash
export BACKEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:v1"
export FRONTEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:v1"
export BACKEND_SERVICE_NAME="backend-service"
export FRONTEND_SERVICE_NAME="frontend-service"
export BACKEND_PORT="8080"
export FRONTEND_CONTAINER_PORT="80"
```

Remarque :

- `8080` et `80` sont ici des valeurs d'exemple conventionnelles
- elles doivent être remplacées par les ports réellement utilisés par l'application

### 2.2 Créer le namespace

```bash
kubectl create namespace "${NAMESPACE}"
```

### 2.3 Créer le backend

```bash
kubectl -n "${NAMESPACE}" create deployment backend \
  --image="${BACKEND_IMAGE}"
```

### 2.4 Exposer le backend en interne

```bash
kubectl -n "${NAMESPACE}" expose deployment backend \
  --name="${BACKEND_SERVICE_NAME}" \
  --port="${BACKEND_PORT}" \
  --target-port="${BACKEND_PORT}" \
  --type=ClusterIP
```

Explication :

- `ClusterIP` rend le backend accessible depuis le cluster uniquement
- cette option convient à un backend appelé par un frontend ou un autre service interne

### 2.5 Créer le frontend

```bash
kubectl -n "${NAMESPACE}" create deployment frontend \
  --image="${FRONTEND_IMAGE}"
```

### 2.6 Exposer le frontend publiquement

```bash
kubectl -n "${NAMESPACE}" expose deployment frontend \
  --name="${FRONTEND_SERVICE_NAME}" \
  --port=80 \
  --target-port="${FRONTEND_CONTAINER_PORT}" \
  --type=LoadBalancer
```

Explication :

- `LoadBalancer` permet une exposition externe via l'infrastructure GKE

### 2.7 Limites de cette approche

- rapidité élevée
- faible traçabilité dans le dépôt
- maintenance moins simple qu'avec des manifests versionnés

---

## 3. Option 2 : créer un socle YAML minimal

Structure recommandée :

```text
k8s/
├── namespace.yaml
├── backend-deployment.yaml
├── backend-service.yaml
├── frontend-deployment.yaml
└── frontend-service.yaml
```

### 3.1 Namespace minimal

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-app
```

### 3.2 Deployment backend minimal

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: my-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: REGION-docker.pkg.dev/PROJECT_ID/REPO/backend:v1
          ports:
            - containerPort: BACKEND_PORT
```

### 3.3 Service backend minimal

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: my-app
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
    - port: BACKEND_PORT
      targetPort: BACKEND_PORT
```

### 3.4 Deployment frontend minimal

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: my-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: REGION-docker.pkg.dev/PROJECT_ID/REPO/frontend:v1
          ports:
            - containerPort: FRONTEND_CONTAINER_PORT
```

### 3.5 Service frontend minimal

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: my-app
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: FRONTEND_CONTAINER_PORT
```

### 3.6 Appliquer le socle

```bash
kubectl apply -f k8s/
```

---

## 4. Vérifications après déploiement

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

## 5. Exemple pour ce projet

Valeurs réelles du dépôt :

```bash
export BACKEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:v1"
export FRONTEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:v1"
export BACKEND_SERVICE_NAME="backend-service"
export FRONTEND_SERVICE_NAME="frontend-service"
export BACKEND_PORT="6543"
export FRONTEND_CONTAINER_PORT="80"
```

Le projet réel s'appuie sur :

- un backend sur le port `6543`
- un frontend Nginx sur le port `80`
- un backend interne en `ClusterIP`
- un frontend exposé en `LoadBalancer`

Une architecture minimale inspirée du projet devrait donc utiliser :

- `backend-service` comme service interne
- `frontend-service` comme service externe
- `/api/health` comme endpoint de vie côté backend
- `/healthz` comme endpoint de vie côté frontend Nginx

Pour un résultat plus fidèle au dépôt réel, le chemin recommandé reste ensuite :

- [Déployer avec Kustomize](./kubectl-kustomize.md)
