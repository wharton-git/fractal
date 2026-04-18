import { CheckCircle2, CircleAlert, Eye } from "lucide-react";
import {
	formatCompactTimestamp,
	formatDuration,
	formatTimestamp,
	serializePayload,
} from "../lib/format";
import type { RequestRecord } from "../types/demo";
import { SectionHeader } from "./SectionHeader";

type RequestResultsProps = {
	requests: RequestRecord[];
	selectedRequestId: string | null;
	onSelectRequest: (requestId: string) => void;
};

const statusBadgeClass = (request: RequestRecord) => {
	if (request.statusCode === 0) {
		return "badge badge-error";
	}

	return request.ok ? "badge badge-success" : "badge badge-warning";
};

export function RequestResults({
	requests,
	selectedRequestId,
	onSelectRequest,
}: RequestResultsProps) {
	const selectedRequest =
		requests.find((request) => request.id === selectedRequestId) ?? requests[0] ?? null;

	return (
		<section className="surface-card p-6 sm:p-7">
			<div className="flex flex-col gap-6">
				<SectionHeader
					eyebrow="Recent Calls"
					title="Resultats des requetes"
					description="Le journal recent affiche l endpoint appele, le temps de reponse, le pod source, le statut HTTP et les parametres utilises. Clique une ligne pour inspecter la reponse brute."
				/>

				<div className="grid gap-3 md:hidden">
					{requests.length === 0 ? (
						<div className="rounded-[1.4rem] border border-base-300/75 bg-base-200/45 px-4 py-6 text-center text-sm text-base-content/60">
							Aucun appel recent pour le moment.
						</div>
					) : (
						requests.map((request) => (
							<article
								key={request.id}
								className={`rounded-[1.35rem] border px-4 py-4 ${
									selectedRequestId === request.id
										? "border-base-300 bg-base-200/60"
										: "border-base-300/75 bg-base-100/75"
								}`}
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="truncate font-medium text-primary">
											{request.endpoint}
										</p>
										<p className="mt-1 text-sm text-base-content/60">
											Pod: {request.podName}
										</p>
									</div>
									<span className={statusBadgeClass(request)}>
										{request.statusCode === 0 ? "network" : request.statusCode}
									</span>
								</div>
								<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
									<div>
										<p className="text-base-content/55">Temps</p>
										<p className="font-medium text-primary">
											{formatDuration(request.durationMs)}
										</p>
									</div>
									<div>
										<p className="text-base-content/55">Horaire</p>
										<p className="font-medium text-primary">
											{formatCompactTimestamp(request.timestamp)}
										</p>
									</div>
									<div className="col-span-2">
										<p className="text-base-content/55">Parametres</p>
										<p className="truncate font-medium text-primary">
											{request.paramsLabel}
										</p>
									</div>
								</div>
								<button
									className="btn btn-ghost btn-sm mt-4 w-full justify-center rounded-full"
									onClick={() => onSelectRequest(request.id)}
								>
									<Eye className="size-4" />
									Voir le detail
								</button>
							</article>
						))
					)}
				</div>

				<div className="hidden overflow-hidden rounded-[1.5rem] border border-base-300/75 md:block">
					<div className="overflow-x-auto">
						<table className="table">
							<thead className="bg-base-200/75 text-base-content/65">
								<tr>
									<th>Endpoint</th>
									<th>Pod</th>
									<th>HTTP</th>
									<th>Temps</th>
									<th>Horodatage</th>
									<th>Parametres</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{requests.length === 0 ? (
									<tr>
										<td colSpan={7} className="py-8 text-center text-base-content/60">
											Aucun appel recent pour le moment.
										</td>
									</tr>
								) : (
									requests.map((request) => (
										<tr
											key={request.id}
											className={
												selectedRequestId === request.id
													? "bg-base-200/55"
													: undefined
											}
										>
											<td className="font-medium text-primary">
												{request.endpoint}
											</td>
											<td>{request.podName}</td>
											<td>
												<span className={statusBadgeClass(request)}>
													{request.statusCode === 0
														? "network"
														: request.statusCode}
												</span>
											</td>
											<td>{formatDuration(request.durationMs)}</td>
											<td>{formatCompactTimestamp(request.timestamp)}</td>
											<td className="max-w-xs truncate">{request.paramsLabel}</td>
											<td>
												<button
													className="btn btn-ghost btn-sm rounded-full"
													onClick={() => onSelectRequest(request.id)}
												>
													<Eye className="size-4" />
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				<div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
					<div className="rounded-[1.5rem] border border-base-300/75 bg-base-200/45 p-4 sm:p-5">
						<div className="mb-4 flex items-center gap-2 text-sm text-base-content/60">
							{selectedRequest?.ok ? (
								<CheckCircle2 className="size-4 text-success" />
							) : (
								<CircleAlert className="size-4 text-warning" />
							)}
							Detail de la requete selectionnee
						</div>

						{selectedRequest ? (
							<div className="space-y-3 text-sm">
								<p>
									<span className="font-medium text-primary">Endpoint:</span>{" "}
									<span className="break-all">{selectedRequest.endpoint}</span>
								</p>
								<p>
									<span className="font-medium text-primary">Pod:</span>{" "}
									<span className="break-all">{selectedRequest.podName}</span>
								</p>
								<p>
									<span className="font-medium text-primary">Statut:</span>{" "}
									{selectedRequest.statusCode === 0
										? selectedRequest.statusText
										: `${selectedRequest.statusCode} ${selectedRequest.statusText}`}
								</p>
								<p>
									<span className="font-medium text-primary">Recu le:</span>{" "}
									{formatTimestamp(selectedRequest.timestamp)}
								</p>
								<p>
									<span className="font-medium text-primary">Parametres:</span>{" "}
									<span className="break-all">{selectedRequest.paramsLabel}</span>
								</p>
								{selectedRequest.errorMessage ? (
									<p className="text-warning">
										<span className="font-medium text-primary">Erreur:</span>{" "}
										{selectedRequest.errorMessage}
									</p>
								) : null}
							</div>
						) : (
							<p className="text-sm text-base-content/65">
								Selectionne une ligne du journal pour afficher plus de details.
							</p>
						)}
					</div>

					<div className="rounded-[1.5rem] border border-base-300/75 bg-neutral text-neutral-content">
						<div className="border-b border-white/10 px-4 py-4 sm:px-5">
							<p className="text-xs uppercase tracking-[0.22em] text-white/55">
								JSON payload
							</p>
							<p className="mt-1 text-lg font-semibold">
								Reponse brute de l API backend
							</p>
						</div>
						<pre className="max-h-[22rem] overflow-auto px-4 py-4 text-xs leading-6 text-white/88 sm:max-h-[26rem] sm:px-5 sm:text-sm">
							{selectedRequest
								? serializePayload(selectedRequest.response)
								: "Aucune reponse selectionnee."}
						</pre>
					</div>
				</div>
			</div>
		</section>
	);
}
