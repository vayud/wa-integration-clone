import { BarChart, Text, Flex, EmptyState, ErrorState, LoadingSpinner } from "@hubspot/ui-extensions";

const SendersTab = ({ data }) => {
	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
	if (data.error) return <ErrorState title="Something went wrong." message={data.error} />;
	if (data.empty)
		return (
			<EmptyState title="Nothing here yet" layout="vertical" reverseOrder={true}>
				<Text>{data.message}</Text>
			</EmptyState>
		);

	return (
		<>
			<BarChart
				data={data}
				axes={{
					x: { field: "userEmail", fieldType: "category", label: "Sender" },
					y: { field: "count", fieldType: "linear", label: "Messages Sent" },
					options: {
						groupFieldByColor: "userEmail",
					},
				}}
				options={{
					showLegend: true,
					showDataLabels: true,
				}}
			/>
			<Flex direction="column" align="center">
				<Text variant="microcopy">
					The chart displays the number of messages sent to this contact, grouped by the sender (user or workflow).
				</Text>
			</Flex>
		</>
	);
};

export default SendersTab;
