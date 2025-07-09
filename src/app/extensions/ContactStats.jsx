import { useState } from "react";
import { useEffect } from "react";
import {
	hubspot,
	EmptyState,
	ErrorState,
	LoadingSpinner,
	Statistics,
	StatisticsItem,
	StatisticsTrend,
	Text,
} from "@hubspot/ui-extensions";

// Helper to build query string
const buildQuery = (params) =>
	Object.entries(params)
		.filter(([key, val]) => val != null && val !== "")
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
		.join("&");

const DynamicCard = ({ context }) => {
	const [data, setData] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			const params = {
				action: "monthly-counts",
				associatedObjectId: context.crm.objectId,
			};

			const url = `https://whatsapp-integration.transfunnel.io/api/contact-stats.php?${buildQuery(params)}`;
			try {
				const response = await hubspot.fetch(url, {
					timeout: 2_000,
					method: "GET",
				});
				const data = await response.json();

				if (data.status === "error") {
					setData({ error: data.message });
					return;
				}

				if (data.status === "empty") {
					setData({ empty: true, message: data.message });
					return;
				}

				if (data.status === "success") {
					if (data && data.stats) {
						setData(data.stats);
					} else {
						setData({ error: "Stats not found in response" });
					}
				}
			} catch (err) {
				console.error("Something went wrong", err);
			}
		};
		fetchData();
	}, [context]);

	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;

	if (data && data.error) {
		return <ErrorState title="Something went wrong."></ErrorState>;
	}

	if (data && data.empty) {
		return (
			<EmptyState title="Nothing here yet" layout="vertical" reverseOrder={true}>
				<Text>{data.message}</Text>
			</EmptyState>
		);
	}

	return (
		<Statistics>
			<StatisticsItem label="Sent" number={data.sent?.this_month ?? 0}>
				{data.sent?.change?.type !== "none" && (
					<StatisticsTrend direction={data.sent?.change?.type} value={`${data.sent?.change?.change ?? 0}%`} />
				)}
				<Text variant="caption">Last month: {data.sent?.last_month ?? 0}</Text>
			</StatisticsItem>
			<StatisticsItem label="Failed" number={data.failed?.this_month ?? 0}>
				{data.failed?.change?.type !== "none" && (
					<StatisticsTrend direction={data.failed?.change?.type} value={`${data.failed?.change?.change ?? 0}%`} />
				)}
				<Text variant="caption">Last month: {data.failed?.last_month ?? 0}</Text>
			</StatisticsItem>
			<StatisticsItem label="Received" number={data.received?.this_month ?? 0}>
				{data.received?.change?.type !== "none" && (
					<StatisticsTrend direction={data.received?.change?.type} value={`${data.received?.change?.change ?? 0}%`} />
				)}
				<Text variant="caption">Last month: {data.received?.last_month ?? 0}</Text>
			</StatisticsItem>
		</Statistics>
	);
};

hubspot.extend(({ context }) => <DynamicCard context={context} />);
