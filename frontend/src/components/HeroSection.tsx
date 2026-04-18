import { ArrowRight, Cloud, ShieldCheck, Zap } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { BackendState } from "../types/demo";

type HeroSectionProps = {
	backendState: BackendState;
	observedPodCount: number;
	latestPodName: string | null;
	onPrimaryAction: () => void;
	onSecondaryAction: () => void;
};

const availabilityLabel = (backendState: BackendState) => {
	switch (backendState) {
		case "ok":
			return "Backend OK";
		case "down":
			return "Backend DOWN";
		case "loading":
			return "Verification en cours";
		default:
			return "En attente d une verification";
	}
};

export function HeroSection({
	backendState,
	observedPodCount,
	latestPodName,
	onPrimaryAction,
	onSecondaryAction,
}: HeroSectionProps) {
	const networkAnimationSrc = `${import.meta.env.BASE_URL}Network.lottie`;

	return (
		<section className="surface-card surface-grid relative overflow-hidden px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(24,24,27,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(82,82,91,0.1),transparent_30%)]" />
			<div className="relative grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
				<div className="min-w-0 flex flex-col gap-6">
					<div className="flex flex-wrap gap-2">
						<span className="badge badge-neutral rounded-full px-3 py-3 text-[0.65rem] uppercase tracking-[0.22em] sm:px-4 sm:text-xs">
							Cloud Scaling Demo App
						</span>
						<span className="badge badge-outline rounded-full px-3 py-3 text-[0.65rem] sm:px-4 sm:text-xs">
							React + Go + Kubernetes
						</span>
					</div>

					<div className="space-y-4">
						<h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-primary sm:text-5xl lg:text-[3.6rem] lg:leading-[1.05]">
							Une APP de démo GKE concue pour l'autoscaling
							et la haute disponibilite.
						</h1>
						<p className="max-w-2xl text-sm leading-7 text-base-content/72 sm:text-lg">
							Cette application est une plateforme de démonstration cloud-native permettant de tester la montée en charge et la haute disponibilité d’un backend via différents scénarios (CPU, latence, requêtes mixtes). Elle visualise en temps réel les performances du système et le comportement des instances (pods), tout en offrant un contrôle précis des tests et du monitoring.
						</p>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
						<button
							type="button"
							className="btn btn-primary w-full justify-center rounded-full px-6 sm:w-auto"
							onClick={onPrimaryAction}
						>
							Lancer une serie
							<ArrowRight className="size-4" />
						</button>
						<button
							type="button"
							className="btn btn-ghost w-full justify-center rounded-full px-6 sm:w-auto"
							onClick={onSecondaryAction}
						>
							Check backend
						</button>
					</div>

					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-3xl border border-base-300/80 bg-base-100/80 p-4">
							<div className="mb-3 flex items-center gap-2 text-sm font-medium text-base-content/65">
								<Cloud className="size-4" />
								Disponibilite
							</div>
							<p className="text-lg font-semibold text-primary">
								{availabilityLabel(backendState)}
							</p>
						</div>
						<div className="rounded-3xl border border-base-300/80 bg-base-100/80 p-4">
							<div className="mb-3 flex items-center gap-2 text-sm font-medium text-base-content/65">
								<ShieldCheck className="size-4" />
								Pods observes
							</div>
							<p className="text-lg font-semibold text-primary">
								{observedPodCount}
							</p>
						</div>
						<div className="rounded-3xl border border-base-300/80 bg-base-100/80 p-4">
							<div className="mb-3 flex items-center gap-2 text-sm font-medium text-base-content/65">
								<Zap className="size-4" />
								Derniere cible
							</div>
							<p className="break-all text-lg font-semibold text-primary sm:truncate">
								{latestPodName ?? "Aucun pod observe"}
							</p>
						</div>
					</div>
				</div>

				<div className="relative min-w-0">
					<div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle,rgba(24,24,27,0.12),transparent_60%)] blur-2xl" />
					<div className="surface-card relative mx-auto w-full overflow-hidden border-base-300/80 bg-neutral text-neutral-content">
						<div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
							<div>
								<p className="text-xs uppercase tracking-[0.22em] text-white/55">
									GKE demo snapshot
								</p>
								<p className="mt-1 text-lg font-semibold">
									Flux de requetes distribue
								</p>
							</div>
							<div className="badge badge-outline border-white/20 text-white/80">
								stateless
							</div>
						</div>

						<div className="grid gap-4 p-4 sm:p-5">
							<div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white">
								<DotLottieReact
									src={networkAnimationSrc}
									loop
									autoplay
									className="block w-full sm:h-64"
									renderConfig={{ autoResize: true }}
								/>
							</div>

							<div className="grid gap-2 sm:grid-cols-3">
								<div className="rounded-2xl border border-white/10 bg-white/6 p-3">
									<p className="text-xs uppercase tracking-[0.22em] text-white/55">
										Replicas
									</p>
									<p className="mt-2 text-2xl font-semibold">2+</p>
								</div>
								<div className="rounded-2xl border border-white/10 bg-white/6 p-3">
									<p className="text-xs uppercase tracking-[0.22em] text-white/55">
										CPU test
									</p>
									<p className="mt-2 text-2xl font-semibold">HPA</p>
								</div>
								<div className="rounded-2xl border border-white/10 bg-white/6 p-3">
									<p className="text-xs uppercase tracking-[0.22em] text-white/55">
										Probe-ready
									</p>
									<p className="mt-2 text-2xl font-semibold">Oui</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
