package podmetrics

import (
	"testing"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	metricsv1beta1 "k8s.io/metrics/pkg/apis/metrics/v1beta1"
)

func TestAggregatePodUsageByName(t *testing.T) {
	t.Parallel()

	metricsList := &metricsv1beta1.PodMetricsList{
		Items: []metricsv1beta1.PodMetrics{
			{
				ObjectMeta: metav1.ObjectMeta{Name: "backend-a"},
				Containers: []metricsv1beta1.ContainerMetrics{
					{
						Name: "app",
						Usage: corev1.ResourceList{
							corev1.ResourceCPU:    resource.MustParse("125m"),
							corev1.ResourceMemory: resource.MustParse("80Mi"),
						},
					},
					{
						Name: "sidecar",
						Usage: corev1.ResourceList{
							corev1.ResourceCPU:    resource.MustParse("25m"),
							corev1.ResourceMemory: resource.MustParse("20Mi"),
						},
					},
				},
			},
			{
				ObjectMeta: metav1.ObjectMeta{Name: "backend-b"},
				Containers: []metricsv1beta1.ContainerMetrics{
					{
						Name: "app",
						Usage: corev1.ResourceList{
							corev1.ResourceCPU:    resource.MustParse("350m"),
							corev1.ResourceMemory: resource.MustParse("128Mi"),
						},
					},
				},
			},
		},
	}

	result := aggregatePodUsageByName(metricsList)

	if len(result) != 2 {
		t.Fatalf("expected 2 pods, got %d", len(result))
	}

	if got := result["backend-a"].CPUUsageMillicores; got != 150 {
		t.Fatalf("expected backend-a cpu usage to be 150m, got %dm", got)
	}

	expectedBackendAMemoryQuantity := resource.MustParse("100Mi")
	expectedBackendAMemory := expectedBackendAMemoryQuantity.Value()
	if got := result["backend-a"].MemoryUsageBytes; got != expectedBackendAMemory {
		t.Fatalf("expected backend-a memory usage to be %d, got %d", expectedBackendAMemory, got)
	}

	if got := result["backend-b"].CPUUsageMillicores; got != 350 {
		t.Fatalf("expected backend-b cpu usage to be 350m, got %dm", got)
	}

	expectedBackendBMemoryQuantity := resource.MustParse("128Mi")
	expectedBackendBMemory := expectedBackendBMemoryQuantity.Value()
	if got := result["backend-b"].MemoryUsageBytes; got != expectedBackendBMemory {
		t.Fatalf("expected backend-b memory usage to be %d, got %d", expectedBackendBMemory, got)
	}
}
