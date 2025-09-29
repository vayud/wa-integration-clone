import React, { useState, useEffect } from "react";
import {
	hubspot,
	Accordion,
	AutoGrid,
	BarChart,
	Box,
	DescriptionList,
	DescriptionListItem,
	Divider,
	EmptyState,
	ErrorState,
	Flex,
	Heading,
	Image,
	LineChart,
	LoadingSpinner,
	Statistics,
	StatisticsItem,
	StatisticsTrend,
	Tag,
	Text,
	Tile,
} from "@hubspot/ui-extensions";

const baseApiUrl = "https://whatsapp-integration.transfunnel.io/api";

// Configuration for each data component
const COMPONENTS_CONFIG = [
	{
		id: "messages",
		title: "Recent Messages",
		action: "recent-messages",
		responseKey: "messages",
		enabled: true,
	},
	{
		id: "senders",
		title: "Message Senders",
		action: "message-senders",
		responseKey: "senders",
		enabled: true,
	},
	{
		id: "counts",
		title: "Message Statistics",
		action: "monthly-counts",
		responseKey: "counts",
		enabled: true,
	},
	{
		id: "trends",
		title: "Monthly Trends",
		action: "monthly-trends",
		responseKey: "trends",
		enabled: true,
	},
	{
		id: "templateUsage",
		title: "Template Usage Distribution",
		action: "template-types",
		responseKey: "templateUsage",
		enabled: true,
	},
];

// Helper function to build query parameters
const buildQuery = (params: Record<string, string | number | boolean | null | undefined>) =>
	Object.entries(params)
		.filter(([_, val]) => val != null && val !== "")
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`)
		.join("&");

// Mapping for message_status to Tag variant
const STATUS_VARIANT_MAP = {
	Accepted: "info",
	Delivered: "success",
	Failed: "danger",
	Read: "success",
	Sent: "default",
	Undelivered: "warning",
	Queued: "warning",
};

// Helper function to format message text with markdown-like formatting
const formatMessageComponents = (input: string) => {
	if (!input) return <Text>""</Text>;

	const regex = /```.*?```|`.*?`|([*_~])(.+?)\1|> .+|([^*_~`>]+)/gm;
	const children = [];

	let match;
	let keyCounter = 0;

	while ((match = regex.exec(input)) !== null) {
		const [fullMatch, symbol, content, plain] = match;

		// Skip unsupported formats
		if (fullMatch.startsWith("```") || fullMatch.startsWith("`") || fullMatch.startsWith(">")) {
			continue;
		}

		if (symbol && content) {
			let format = {};
			if (symbol === "*") format = { fontWeight: "bold" };
			else if (symbol === "_") format = { italic: true };
			else if (symbol === "~") format = { lineDecoration: "strikethrough" };

			children.push(
				<Text key={`f-${keyCounter++}`} inline={true} format={format}>
					{content}
				</Text>
			);
		} else if (plain) {
			children.push(
				<Text key={`p-${keyCounter++}`} inline={true}>
					{plain}
				</Text>
			);
		}
	}

	return <Text>{children}</Text>;
};

// Helper to check if a component is enabled
const isEnabled = (componentId: string) => {
	const config = COMPONENTS_CONFIG.find((c) => c.id === componentId);
	return config?.enabled ?? true;
};

// Helper to get comma-separated list of enabled component IDs
const getEnabledComponentIds = () => {
	return COMPONENTS_CONFIG.filter((c) => c.enabled)
		.map((c) => c.id)
		.join(",");
};

const NewHomesPage = ({ context }: { context: any }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [allData, setAllData] = useState({
		messages: null,
		senders: null,
		counts: null,
		trends: null,
		templateUsage: null,
	});

	// Single data fetching function for all components
	const fetchAllData = async () => {
		setLoading(true);
		setError(null);

		try {
			const enabledComponents = getEnabledComponentIds();

			const url = `${baseApiUrl}/stats.php?${buildQuery({
				action: "all-stats",
				components: enabledComponents,
			})}`;

			const res = await hubspot.fetch(url, { timeout: 5000 });
			const json = await res.json();

			if (json.status === "error") {
				setError(json.message || "Failed to load data");
			} else {
				setAllData({
					messages: json.data.messages || null,
					senders: json.data.senders || null,
					counts: json.data.counts || null,
					trends: json.data.trends || null,
					templateUsage: json.data.templateUsage || null,
				});
			}
		} catch (err) {
			setError("Failed to fetch data");
		} finally {
			setLoading(false);
		}
	};

	// Load all data on mount
	useEffect(() => {
		fetchAllData();
	}, []);

	// Helper function to check if data is empty
	const isEmpty = (data: any) =>
		!data || (Array.isArray(data) && data.length === 0) || (typeof data === "object" && Object.keys(data).length === 0);

	// Helper function to render tile content based on loading/error/data state
	const renderTileContent = (data: any, emptyMessage: string, children: React.ReactNode) => {
		if (loading) {
			return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
		}
		if (error) {
			return (
				<ErrorState title="Failed to load data">
					<Text>{error}</Text>
				</ErrorState>
			);
		}
		if (isEmpty(data)) {
			return (
				<EmptyState title="Nothing here yet" layout="vertical" reverseOrder={true}>
					<Text>{emptyMessage}</Text>
				</EmptyState>
			);
		}
		return children;
	};

	return (
		<>
			<Text>
				This dashboard provides insights into your account's messaging activities through WhatsApp Integration. Data is
				refreshed every time you open/refresh this page.
			</Text>
			<Flex direction="column" gap="md">
				<AutoGrid columnWidth={1000} flexible={true} gap="md">
					{/* Monthly Trends Tile */}
					{isEnabled("trends") && (
						<Tile compact={true}>
							<Flex direction="column" gap="lg">
								<Box>
									<Heading>Monthly Trends</Heading>
									<Divider />
									{renderTileContent(
										allData.trends,
										"No recent trends data to display",
										<>
											<LineChart
												data={
													allData.trends?.flatMap((row) => [
														{ Month: row.month, Metric: "Sent", "Message Counts": row.sent },
														{ Month: row.month, Metric: "Failed", "Message Counts": row.failed },
														{ Month: row.month, Metric: "Received", "Message Counts": row.received },
													]) || []
												}
												axes={{
													x: { field: "Month", fieldType: "category" },
													y: { field: "Message Counts", fieldType: "linear" },
													options: { groupFieldByColor: "Metric" },
												}}
												options={{
													showLegend: true,
													showDataLabels: true,
													showTooltips: true,
													colorList: ["green", "darkOrange", "darkBlue"],
												}}
											/>
											<Flex direction="column" align="center">
												<Text variant="microcopy">
													The chart displays a monthly breakdown of WhatsApp messages, covering up to the last 12
													months.
												</Text>
											</Flex>
										</>
									)}
								</Box>
								<Box>
									{renderTileContent(
										allData.counts,
										"No recent statistics data to display",
										<Statistics>
											{["sent", "failed", "received"].map((type) => (
												<StatisticsItem
													key={type}
													label={type.charAt(0).toUpperCase() + type.slice(1)}
													number={allData.counts?.[type]?.this_month ?? 0}
												>
													{allData.counts?.[type]?.change?.type !== "none" && allData.counts?.[type]?.change && (
														<StatisticsTrend
															direction={allData.counts[type].change.type}
															value={`${allData.counts[type].change.change ?? 0}%`}
														/>
													)}
													<Text variant="microcopy">Last month: {allData.counts?.[type]?.last_month ?? 0}</Text>
												</StatisticsItem>
											))}
										</Statistics>
									)}
								</Box>
							</Flex>
						</Tile>
					)}

					{/* Recent Messages Tile */}
					{isEnabled("messages") && (
						<Tile compact={true}>
							<Heading>Recent Messages</Heading>
							<Divider />
							{renderTileContent(
								allData.messages,
								"No recent messages to display",
								<Flex direction="column" gap="xs">
									{allData.messages?.map((message, index) => {
										// Skip rendering if message is empty or null
										if (!message.message) {
											return null;
										}

										var itemTitle =
											message.action === "sent"
												? `Message Sent | ${message.timestamp}`
												: `Message Received | ${message.timestamp}`;
										return (
											<Accordion key={index} title={itemTitle}>
												<Flex direction="column" gap="sm" justify="center" align="center">
													{/* <Text> {message.message} </Text> */}
													<Flex wrap="wrap" gap="xs" align="baseline">
														{formatMessageComponents(message.message)}
													</Flex>
													{message.media_type == "image" && message.media_url && (
														<Image alt="Image" src={message.media_url} />
													)}
												</Flex>
												<>
													<Divider />
													<DescriptionList direction="row">
														{message.action === "sent" && (
															<DescriptionListItem label="Status">
																<Tag variant={STATUS_VARIANT_MAP[message.message_status] || "default"}>
																	{message.message_status || "N/A"}
																</Tag>
															</DescriptionListItem>
														)}
														{message.action === "sent" && (
															<DescriptionListItem label="Campaign">
																<Text>{message.campaign || "N/A"}</Text>
															</DescriptionListItem>
														)}
														<DescriptionListItem label="Sent By">
															<Text>{message.sent_by || "N/A"}</Text>
														</DescriptionListItem>
													</DescriptionList>
												</>
											</Accordion>
										);
									})}
									<Flex direction="column" align="center">
										<Text variant="microcopy">
											The last 10 messages sent and received through WhatsApp Integration for your account.
										</Text>
									</Flex>
								</Flex>
							)}
						</Tile>
					)}
				</AutoGrid>

				<AutoGrid columnWidth={500} flexible={true} gap="md">
					{/* Message Senders Tile */}
					{isEnabled("senders") && (
						<Tile compact={true}>
							<Heading>Message Senders</Heading>
							<Divider />
							{renderTileContent(
								allData.senders,
								"No recent sender data to display",
								<>
									<BarChart
										data={allData.senders}
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
											The chart displays the number of messages sent, grouped by the sender (user or workflow).
										</Text>
									</Flex>
								</>
							)}
						</Tile>
					)}

					{/* Template Usage Distribution Tile */}
					{isEnabled("templateUsage") && (
						<Tile compact={true}>
							<Heading>Template Usage Distribution</Heading>
							<Divider />
							{renderTileContent(
								allData.templateUsage,
								"No recent template usage data to display",
								<>
									<BarChart
										data={
											allData.templateUsage
												? Object.entries(allData.templateUsage).map(([type, count]) => ({ type, count: Number(count) }))
												: []
										}
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
											The chart displays the usage counts of various WhatsApp message template types over last 30 days.
										</Text>
									</Flex>
								</>
							)}
						</Tile>
					)}
				</AutoGrid>
			</Flex>
		</>
	);
};

hubspot.extend<"home">(({ context }) => {
	return <NewHomesPage context={context} />;
});
