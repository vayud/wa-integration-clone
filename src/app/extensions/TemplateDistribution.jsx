import { useState, useEffect } from "react";
import { hubspot, EmptyState, ErrorState, LoadingSpinner, LineChart, Text } from "@hubspot/ui-extensions";

// Helper to build query string
const buildQuery = (params) =>
	Object.entries(params)
		.filter(([key, val]) => val != null && val !== "")
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
		.join("&");

const TrendsCard = ({ context }) => {
	const [data, setData] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			const params = {
				action: "monthly-trends",
				associatedObjectId: context.crm.objectId,
			};

			const url = `https://whatsapp-integration.transfunnel.io/api/contact-stats.php?${buildQuery(params)}`;
			try {
				const response = await hubspot.fetch(url, {
					timeout: 2_000,
					method: "GET",
				});
				const data = await response.json();
				console.log(data);

				if (data.status === "error") {
					setData({ error: data.message });
					return;
				}

				if (data.status === "empty") {
					setData({ empty: true, message: data.message });
					return;
				}

				if (data.status === "success") {
					if (data && data.trends) {
						setData(data.trends);
					} else {
						setData({ error: "Trends data not found in response" });
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

	const chartData = [];
	data.forEach((row) => {
		chartData.push(
			{ Month: row.month, Metric: "Sent", Count: row.sent },
			{ Month: row.month, Metric: "Failed", Count: row.failed },
			{ Month: row.month, Metric: "Received", Count: row.received }
		);
	});

	return (
		<LineChart
			data={chartData}
			axes={{
				x: { field: "Month", fieldType: "category" },
				y: { field: "Count", fieldType: "linear" },
				options: {
					groupFieldByColor: "Metric",
					// stacking: true,
				},
			}}
			options={{
				showLegend: true,
				showDataLabels: true,
				colorList: ["darkGreen", "darkOrange", "darkBlue"],
			}}
		/>
	);
};

hubspot.extend(({ context }) => <TrendsCard context={context} />);
