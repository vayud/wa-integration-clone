import { LineChart, Text, Flex } from "@hubspot/ui-extensions";

const TrendsTab = ({ data }) => {
	const chartData = data?.flatMap((row) => [
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
					months.
				</Text>
			</Flex>
		</>
	);
};

export default TrendsTab;
