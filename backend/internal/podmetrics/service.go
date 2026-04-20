package podmetrics

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
	metricsv1beta1 "k8s.io/metrics/pkg/apis/metrics/v1beta1"
	metricsclient "k8s.io/metrics/pkg/client/clientset/versioned"
)

const serviceAccountNamespacePath = "/var/run/secrets/kubernetes.io/serviceaccount/namespace"

type PodUsage struct {
	CPUUsageMillicores int64 `json:"cpuUsageMillicores"`
	MemoryUsageBytes   int64 `json:"memoryUsageBytes"`
}

type Snapshot struct {
	Available bool                `json:"available"`
	Source    string              `json:"source"`
	Namespace string              `json:"namespace,omitempty"`
	Timestamp string              `json:"timestamp"`
	Pods      map[string]PodUsage `json:"pods"`
	Error     string              `json:"error,omitempty"`
}

type Service struct {
	client    *metricsclient.Clientset
	namespace string
	now       func() time.Time
	initError string
}

func NewService() *Service {
	service := &Service{
		now: time.Now,
	}

	namespace := discoverNamespace()
	if namespace == "" {
		service.initError = "pod metrics are only available from inside Kubernetes"
		return service
	}

	config, err := rest.InClusterConfig()
	if err != nil {
		service.namespace = namespace
		service.initError = fmt.Sprintf("failed to create in-cluster metrics config: %v", err)
		return service
	}

	client, err := metricsclient.NewForConfig(config)
	if err != nil {
		service.namespace = namespace
		service.initError = fmt.Sprintf("failed to create metrics client: %v", err)
		return service
	}

	service.client = client
	service.namespace = namespace
	return service
}

func (s *Service) Snapshot(ctx context.Context) Snapshot {
	snapshot := Snapshot{
		Available: false,
		Source:    "metrics.k8s.io/v1beta1",
		Namespace: s.namespace,
		Timestamp: s.now().UTC().Format(time.RFC3339Nano),
		Pods:      map[string]PodUsage{},
	}

	if s.initError != "" {
		snapshot.Error = s.initError
		return snapshot
	}

	if s.client == nil || s.namespace == "" {
		snapshot.Error = "metrics client is not configured"
		return snapshot
	}

	podMetricsList, err := s.client.MetricsV1beta1().PodMetricses(s.namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		snapshot.Error = fmt.Sprintf("failed to list pod metrics: %v", err)
		return snapshot
	}

	snapshot.Available = true
	snapshot.Pods = aggregatePodUsageByName(podMetricsList)
	return snapshot
}

func aggregatePodUsageByName(podMetricsList *metricsv1beta1.PodMetricsList) map[string]PodUsage {
	pods := map[string]PodUsage{}

	if podMetricsList == nil {
		return pods
	}

	for _, podMetrics := range podMetricsList.Items {
		var cpuUsageMillicores int64
		var memoryUsageBytes int64

		for _, container := range podMetrics.Containers {
			if cpuQuantity := container.Usage.Cpu(); cpuQuantity != nil {
				cpuUsageMillicores += cpuQuantity.MilliValue()
			}
			if memoryQuantity := container.Usage.Memory(); memoryQuantity != nil {
				memoryUsageBytes += memoryQuantity.Value()
			}
		}

		pods[podMetrics.Name] = PodUsage{
			CPUUsageMillicores: cpuUsageMillicores,
			MemoryUsageBytes:   memoryUsageBytes,
		}
	}

	return pods
}

func discoverNamespace() string {
	if namespace := strings.TrimSpace(os.Getenv("POD_NAMESPACE")); namespace != "" {
		return namespace
	}

	rawNamespace, err := os.ReadFile(serviceAccountNamespacePath)
	if err != nil {
		return ""
	}

	return strings.TrimSpace(string(rawNamespace))
}
