import {
	ArrowDownUp,
	CheckCircle2,
	CircleAlert,
	ClockFading,
	Cpu,
	Globe,
	MemoryStick,
	OctagonX,
	Server,
} from "lucide-react";
import {
	formatAverage,
	formatBytes,
	formatCompactTimestamp,
	formatDecimal,
	formatMillicores,
} from "../lib/format";
import type { PodObservation } from "../types/demo";
import { SectionHeader } from "./SectionHeader";

type ObservedPodsProps = {
	pods: PodObservation[];
};

export function ObservedPods({ pods }: ObservedPodsProps) {
	return (
		<section className="surface-card p-6">
			<div className="flex flex-col gap-6">
				<SectionHeader
					eyebrow="Observed Pods"
					title="Visualisation des pods observes"
					description="Les metriques applicatives viennent des snapshots backend par pod. Le CPU et la memoire sont maintenant recuperes cluster-wide via la Metrics API Kubernetes."
				/>

				{pods.length > 1 ? (
					<div className="alert border border-success/20 bg-success/10 text-success">
						<CheckCircle2 className="size-5" />
						<span>
							Plusieurs pods backend ont deja repondu. Le load balancing est
							bien visible.
						</span>
					</div>
				) : (
					<div className="alert border border-base-300/80 bg-base-200/50 text-base-content/72">
						<CircleAlert className="size-5" />
						<span>
							Un seul pod est visible pour l instant. Augmente la charge ou la
							concurrence pour observer la distribution.
						</span>
					</div>
				)}

				<div className="grid gap-4">
					{pods.length === 0 ? (
						<div className="rounded-[1.4rem] border border-dashed border-base-300/80 bg-base-200/45 p-6 text-[0.72rem] text-base-content/65">
							Aucun pod n a encore ete observe par le monitoring backend.
						</div>
					) : (
						pods.map((pod) => (
							<div
								key={pod.podName}
								className="rounded-3xl border border-base-300/75 bg-base-200/42 p-4"
							>
								<div className="flex items-center gap-3 ">
									<div>
										<div className="rounded-2xl bg-base-100 p-3 text-primary shadow-sm">
											<Server className="size-6" />
										</div>
									</div>

									<div className="flex flex-col flex-1 space-y-2">
										<div className="min-w-0">
											<div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-primary">
												<span className="mr-2 text-sm">{pod.podName}</span>
												<div className="flex items-center gap-2 badge badge-primary text-primary-content">
													<div>
														<ClockFading size="15"/>
													</div>
													<div className="text-[0.7rem] text-primary-content">
														{formatCompactTimestamp(pod.lastSeen)}
													</div>
												</div>
											</div>
											{!pod.hasBackendSnapshot ? (
												<p className="mt-1 text-xs text-base-content/52">
													Snapshot /api/status en attente pour ce pod.
												</p>
											) : null}
										</div>

										<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
											<div className="flex shrink-0 items-center gap-1">
												<div>
													<Globe size="17" />
												</div>
												<div className="text-xs">
													{pod.requestCount ?? "n/d"}
												</div>
											</div>
											<div className="flex shrink-0 items-center gap-1">
												<div>
													<OctagonX size="17" />
												</div>
												<div className="text-xs">
													{pod.errorCount ?? "n/d"}
												</div>
											</div>
											<div className="flex shrink-0 items-center gap-1">
												<div>
													<ArrowDownUp size="17" />
												</div>
												<div className="text-xs">
													{pod.averageResponseTimeMs === null ? "n/d" : formatAverage(pod.averageResponseTimeMs)}
												</div>
											</div>
											<div className="flex shrink-0 items-center gap-1">
												<div>
													<MemoryStick size="17" />
												</div>
												<div className="text-xs">
													{formatBytes(pod.memoryUsageBytes)}
													{pod.memoryLimitUnlimited
														? " / illimitee"
														: pod.memoryCgroupLimitBytes == null
															? ""
															: ` / ${formatBytes(pod.memoryCgroupLimitBytes)}`}
												</div>
											</div>
											<div className="flex shrink-0 items-center gap-1">
												<div>
													<Cpu size="17" />
												</div>
												<div className="text-xs">
													{formatMillicores(pod.cpuUsageMillicores)}
												</div>
											</div>

											<div className="shrink-0">
												<p className="text-xs font-semibold text-primary">
													{pod.cpuQuotaCores === null
														? "n/d"
														: `Limite ${formatDecimal(pod.cpuQuotaCores * 1000, "mCPU")}`}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</section>
	);
}
