import { BarChart, Text, Flex } from "@hubspot/ui-extensions";

const DistributionTab = ({ data }) => {
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
					showDataLabels: true,
				}}
			/>
			<Flex direction="column" align="center">
				<Text variant="microcopy">
					The chart displays the distribution of WhatsApp message templates sent to this contact, grouped by template
					type.
				</Text>
			</Flex>
		</>
	);
};

export default DistributionTab;
