import { BarChart, Text, Flex, EmptyState, ErrorState, LoadingSpinner } from "@hubspot/ui-extensions";

const DistributionTab = ({ data }) => {
	console.log("distribution data: ", data);

	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
	if (data.error) return <ErrorState title="Something went wrong." message={data.error} />;
	if (data.empty)
		return (
			<EmptyState title="Nothing here yet" layout="vertical" reverseOrder={true}>
				<Text>{data.message}</Text>
			</EmptyState>
		);

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
