import { useState } from "react";
import { hubspot, Button, ButtonRow, Divider, EmptyState, ErrorState, Flex, LineChart, Link, LoadingSpinner, Text } from "@hubspot/ui-extensions";

const baseApiUrl = "https://whatsapp-integration.transfunnel.io";

const TrendsTab = ({ data, error, context }) => {
	const [chartLink, setChartLink] = useState(null);
	const [showLink, setShowLink] = useState(false);

	const handleGenerateChart = async (theme) => {
		try {
			const response = await hubspot.fetch(`${baseApiUrl}/api/chart-download.php`, {
				method: 'POST',
				body: {
					action: 'monthly-trends',
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
			<Flex direction="row" justify="between" align="center" gap="sm">
				<Text variant="microcopy">
					The chart displays a monthly breakdown of WhatsApp messages for this contact, covering up to the last 12
					months. Months with no activity are excluded.
				</Text>
				<ButtonRow dropDownButtonOptions={{ size: "sm", variant: "secondary", text: "Options" }}>
					<Button size="sm" type="button" variant="secondary" truncate={true} onClick={() => handleGenerateChart('light')}> Generate Chart Image (Light) </Button>
					<Button size="sm" type="button" variant="secondary" truncate={true} onClick={() => handleGenerateChart('dark')}> Generate Chart Image (Dark) </Button>
				</ButtonRow>
			</Flex>
			{chartLink && showLink && (
				<>
					<Divider />
					<Link href={{
						url: chartLink,
						external: true,
					}} onClick={handleLinkClick}>Download Chart</Link>
				</>
			)}
		</>
	);
};

export default TrendsTab;
