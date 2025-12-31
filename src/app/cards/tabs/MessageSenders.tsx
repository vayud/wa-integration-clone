import { useState, useEffect } from "react";
import {
	hubspot,
	BarChart,
	Button,
	ButtonRow,
	Divider,
	EmptyState,
	ErrorState,
	Flex,
	Link,
	LoadingSpinner,
	Text,
} from "@hubspot/ui-extensions";

const baseUrl = "https://whatsapp-integration.transfunnel.io/api";

const MessageSendersTab = ({ context, isSelected }: any) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [hasFetched, setHasFetched] = useState(false);
	const [chartLink, setChartLink] = useState<string | null>(null);
	const [showLink, setShowLink] = useState(false);

	useEffect(() => {
		if (!isSelected) {
			return;
		}

		if (hasFetched && data) {
			return;
		}

		const fetchData = async () => {
			setLoading(true);

			try {
				const endpoint = `${baseUrl}/contact-stats.php?action=message-senders&associatedObjectId=${context.crm.objectId}`;

				const response = await hubspot.fetch(endpoint, {
					method: "GET",
				});
				const result = await response.json();

				if (result.status === "empty") {
					setData({ empty: true, message: result.message });
					setHasFetched(true);
				} else if (result.status === "error" || !result.senders) {
					setError(result.message || "Invalid data");
					setHasFetched(true);
				} else {
					setData(result.senders);
					setHasFetched(true);
				}
			} catch (err) {
				console.error("Error fetching message senders:", err);
				setError("Failed to load data");
				setHasFetched(true);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [isSelected, context.crm.objectId]);

	const handleGenerateChart = async (theme: string) => {
		try {
			const response = await hubspot.fetch(`${baseUrl}/chart-download.php`, {
				method: "POST",
				body: {
					action: "message-senders",
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

	if (!isSelected) {
		return null;
	}

	return (
		<Flex direction="column" gap="md">
			{loading && <LoadingSpinner layout="centered" size="md" label="Loading..." />}

			{!loading && data?.empty && (
				<EmptyState title="Nothing here yet" layout="vertical" reverseOrder={true}>
					<Text>{data.message}</Text>
				</EmptyState>
			)}

			{!loading && error && (
				<ErrorState title="Something went wrong." type="error">
					<Text>{error}</Text>
				</ErrorState>
			)}

			{!loading && !error && data && !data.empty && (
				<>
					<BarChart
						data={data}
						options={{ showLegend: true, showDataLabels: true }}
						axes={{
							x: { field: "userEmail", fieldType: "category", label: "Sender" },
							y: { field: "count", fieldType: "linear", label: "Messages Sent" },
							options: { groupFieldByColor: "userEmail" },
						}}
					/>
					<Flex direction="row" justify="between" align="center" gap="sm">
						<Text variant="microcopy">
							The chart displays the number of messages sent to this contact, grouped by the sender (user or workflow).
						</Text>
						<ButtonRow dropDownButtonOptions={{ size: "sm", variant: "secondary", text: "Options" }}>
							<Button size="sm" type="button" variant="secondary" onClick={() => handleGenerateChart("light")}>
								Generate Chart Image (Light)
							</Button>
							<Button size="sm" type="button" variant="secondary" onClick={() => handleGenerateChart("dark")}>
								Generate Chart Image (Dark)
							</Button>
						</ButtonRow>
					</Flex>
					{chartLink && showLink && (
						<>
							<Divider />
							<Link
								href={{
									url: chartLink,
									external: true,
								}}
								onClick={handleLinkClick}
							>
								Download Chart
							</Link>
						</>
					)}
				</>
			)}
		</Flex>
	);
};

export default MessageSendersTab;
