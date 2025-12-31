import { useState, useEffect } from "react";
import {
	hubspot,
	Button,
	ButtonRow,
	Divider,
	EmptyState,
	ErrorState,
	Flex,
	LineChart,
	Link,
	LoadingSpinner,
	Text,
} from "@hubspot/ui-extensions";

const baseUrl = "https://whatsapp-integration.transfunnel.io/api";

const MessageTrendsTab = ({ context, isSelected }: any) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [hasFetched, setHasFetched] = useState(false);
	const [chartLink, setChartLink] = useState<string | null>(null);
	const [showLink, setShowLink] = useState(false);

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
				const endpoint = `${baseUrl}/contact-stats.php?action=monthly-trends&associatedObjectId=${context.crm.objectId}`;

				const response = await hubspot.fetch(endpoint, {
					method: "GET",
				});
				const result = await response.json();

				if (result.status === "empty") {
					setData({ empty: true, message: result.message });
					setHasFetched(true);
				} else if (result.status === "error" || !result.trends) {
					setError(result.message || "Invalid data");
					setHasFetched(true);
				} else {
					setData(result.trends);
					setHasFetched(true);
				}
			} catch (err) {
				console.error("Error fetching message trends:", err);
				setError("Failed to load data");
				setHasFetched(true);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [isSelected, context.crm.objectId]);

	const handleGenerateChart = async (theme: string) => {
		try {
			const response = await hubspot.fetch(`${baseUrl}/chart-download.php`, {
				method: "POST",
				body: {
					action: "monthly-trends",
					chartTheme: theme,
					portalId: context.portal.id,
					associatedObjectId: context.crm.objectId,
				},
			});

			if (!response.ok) {
				return;
			}

			const result = await response.json();
			if (result.url) {
				setChartLink(result.url);
				setShowLink(true);
			}
		} catch (err) {
			return;
		}
	};

	const handleLinkClick = () => {
		setTimeout(() => {
			setShowLink(false);
		}, 5000);
	};

	if (!isSelected) {
		return null;
	}

	const chartData =
		data && !data.empty
			? data.flatMap((row: any) => [
					{ Month: row.month, Metric: "Sent", Count: row.sent },
					{ Month: row.month, Metric: "Failed", Count: row.failed },
					{ Month: row.month, Metric: "Received", Count: row.received },
			  ])
			: [];

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
				<>
					<LineChart
						data={chartData}
						axes={{
							x: { field: "Month", fieldType: "category" },
							y: { field: "Count", fieldType: "linear" },
							options: { groupFieldByColor: "Metric" },
						}}
						options={{
							showLegend: true,
							showDataLabels: true,
							colorList: ["darkGreen", "darkOrange", "darkBlue"],
						}}
					/>
					<Flex direction="row" justify="between" align="center" gap="sm">
						<Text variant="microcopy">
							The chart displays a monthly breakdown of WhatsApp messages for this contact, covering up to the last 12
							months. Months with no activity are excluded.
						</Text>
						<ButtonRow dropDownButtonOptions={{ size: "sm", variant: "secondary", text: "Options" }}>
							<Button size="sm" type="button" variant="secondary" onClick={() => handleGenerateChart("light")}>
								Generate Chart Image (Light)
							</Button>
							<Button size="sm" type="button" variant="secondary" onClick={() => handleGenerateChart("dark")}>
								Generate Chart Image (Dark)
							</Button>
						</ButtonRow>
					</Flex>
					{chartLink && showLink && (
						<>
							<Divider />
							<Link
								href={{
									url: chartLink,
									external: true,
								}}
								onClick={handleLinkClick}
							>
								Download Chart
							</Link>
						</>
					)}
				</>
			)}
		</Flex>
	);
};

export default MessageTrendsTab;
