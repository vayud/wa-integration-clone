import { useState } from "react";
import { hubspot, BarChart, Button, ButtonRow, Divider, EmptyState, ErrorState, Flex, Link, LoadingSpinner, Text } from "@hubspot/ui-extensions";

const baseApiUrl = "https://whatsapp-integration.transfunnel.io";

const SendersTab = ({ data, error, context }) => {
	const [chartLink, setChartLink] = useState(null);
	const [showLink, setShowLink] = useState(false);

	const handleGenerateChart = async (theme) => {
		try {
			const response = await hubspot.fetch(`${baseApiUrl}/api/chart-download.php`, {
				method: 'POST',
				body: {
					action: 'message-senders',
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

	return (
		<>
			<BarChart data={data} options={{ showLegend: true, showDataLabels: true }} axes={{
				x: { field: "userEmail", fieldType: "category", label: "Sender" },
				y: { field: "count", fieldType: "linear", label: "Messages Sent" },
				options: { groupFieldByColor: "userEmail" },
			}} />
			<Flex direction="row" justify="between" align="center" gap="sm">
				<Text variant="microcopy">The chart displays the number of messages sent to this contact, grouped by the sender (user or workflow).</Text>
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

export default SendersTab;
