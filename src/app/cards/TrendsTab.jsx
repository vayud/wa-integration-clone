import { LineChart, Text, Flex, EmptyState, ErrorState, LoadingSpinner } from "@hubspot/ui-extensions";

const TrendsTab = ({ data, error }) => {
	console.log("trends data: ", data);
	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
	if (error) return <ErrorState title="Something went wrong." message={error} />;
	if (data.empty)
		return (
			<EmptyState title="Nothing here yet" layout="vertical" reverseOrder={true}>
				<Text>{data.message}</Text>
			</EmptyState>
		);

	const chartData = data.flatMap((row) => [
		{ Month: row.month, Metric: "Sent", Count: row.sent },
		{ Month: row.month, Metric: "Failed", Count: row.failed },
		{ Month: row.month, Metric: "Received", Count: row.received },
	]);

	return (
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
			<Flex direction="column" align="center">
				<Text variant="microcopy">
					The chart displays a monthly breakdown of WhatsApp messages for this contact, covering up to the last 12
					months. Months with no activity are excluded.
				</Text>
			</Flex>
		</>
	);
};

export default TrendsTab;
