import { useState } from "react";
import { hubspot, BarChart, Button, ButtonRow, Divider, EmptyState, ErrorState, Flex, Link, LoadingSpinner, Text } from "@hubspot/ui-extensions";

const baseApiUrl = "https://whatsapp-integration.transfunnel.io";

const DistributionTab = ({ data, error, context }) => {
	const [chartLink, setChartLink] = useState(null);
	const [showLink, setShowLink] = useState(false);

	const handleGenerateChart = async (theme) => {
		try {
			const response = await hubspot.fetch(`${baseApiUrl}/api/chart-download.php`, {
				method: 'POST',
				body: {
					action: 'template-usage',
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

	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
	if (error) return <ErrorState title="Something went wrong." message={error} />;
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
			<Flex direction="row" justify="between" align="center" gap="sm">
				<Text variant="microcopy">
					The chart displays the distribution of WhatsApp message templates sent to this contact, grouped by template type.
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

export default DistributionTab;
