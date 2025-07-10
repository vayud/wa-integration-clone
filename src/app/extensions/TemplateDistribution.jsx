import { useState, useEffect } from "react";
import { hubspot, EmptyState, ErrorState, LoadingSpinner, BarChart, Text, Flex } from "@hubspot/ui-extensions";

// Helper to build query string
const buildQuery = (params) =>
	Object.entries(params)
		.filter(([key, val]) => val != null && val !== "")
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
		.join("&");

const DistributionCard = ({ context }) => {
	const [data, setData] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			const params = {
				action: "template-types",
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
					if (data && data.distribution) {
						setData(data.distribution);
					} else {
						setData({ error: "Distribution data not found in response" });
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

	const chartData = Object.entries(data).map(([type, count]) => ({ type, count }));

	return (
		<>
			<BarChart
				data={chartData}
				axes={{
					x: { field: "type", fieldType: "category", label: "Template Type" },
					y: { field: "count", fieldType: "linear", label: "Count" },
					options: {
						groupFieldByColor: "type",
						colors: {
							"Call to action": "darkBlue",
							Card: "purple",
							Carousel: "orange",
							Media: "darkGreen",
							"Quick reply": "darkOrange",
							Text: "aqua",
						},
					},
				}}
				options={{
					showLegend: true,
					showDataLabels: true
				}}
			/>
			<Flex direction="column" align="center">
				<Text variant="microcopy">
					The chart displays the distribution of WhatsApp message templates sent to this contact, grouped by template type.
				</Text>
			</Flex>
		</>
	);
};

hubspot.extend(({ context }) => <DistributionCard context={context} />);
