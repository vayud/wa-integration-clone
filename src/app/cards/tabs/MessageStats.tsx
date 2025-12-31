import { useState, useEffect } from "react";
import {
	hubspot,
	Statistics,
	StatisticsItem,
	StatisticsTrend,
	Text,
	ErrorState,
	EmptyState,
	LoadingSpinner,
	Flex,
} from "@hubspot/ui-extensions";

const baseUrl = "https://whatsapp-integration.transfunnel.io/api";

const MessageStatsTab = ({ context, isSelected }: any) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [hasFetched, setHasFetched] = useState(false);

	useEffect(() => {
		if (!isSelected) {
			return;
		}

		if (hasFetched && data) {
			return;
		}

		const fetchData = async () => {
			setLoading(true);

			try {
				const endpoint = `${baseUrl}/contact-stats.php?action=monthly-counts&associatedObjectId=${context.crm.objectId}`;

				const response = await hubspot.fetch(endpoint, {
					method: "GET",
				});
				const result = await response.json();

				if (result.status === "empty") {
					setData({ empty: true, message: result.message });
					setHasFetched(true);
				} else if (result.status === "error" || !result.stats) {
					setError(result.message || "Invalid data");
					setHasFetched(true);
				} else {
					setData(result.stats);
					setHasFetched(true);
				}
			} catch (err) {
				console.error("Error fetching message stats:", err);
				setError("Failed to load statistics");
				setHasFetched(true);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [isSelected, context.crm.objectId]);

	if (!isSelected) {
		return null;
	}

	return (
		<Flex direction="column" gap="md">
			{loading && <LoadingSpinner layout="centered" size="md" label="Loading..." />}

			{!loading && data?.empty && (
				<EmptyState title="Nothing here yet" layout="vertical" reverseOrder={true}>
					<Text>{data.message}</Text>
				</EmptyState>
			)}

			{!loading && error && (
				<ErrorState title="Something went wrong." type="error">
					<Text>{error}</Text>
				</ErrorState>
			)}

			{!loading && !error && data && !data.empty && (
				<Statistics>
					{["sent", "failed", "received"].map((type) => (
						<StatisticsItem
							key={type}
							label={type.charAt(0).toUpperCase() + type.slice(1)}
							number={data?.[type]?.this_month ?? 0}
						>
							{data?.[type]?.change?.type !== "none" && (
								<StatisticsTrend direction={data[type].change.type} value={`${data[type].change.change ?? 0}%`} />
							)}
							<Text variant="microcopy">Last month: {data?.[type]?.last_month ?? 0}</Text>
						</StatisticsItem>
					))}
				</Statistics>
			)}
		</Flex>
	);
};

export default MessageStatsTab;
