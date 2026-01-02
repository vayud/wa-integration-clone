import React, { useState, useEffect } from "react";
import {
	hubspot,
	Accordion,
	AutoGrid,
	Button,
	ButtonRow,
	BarChart,
	Box,
	DescriptionList,
	DescriptionListItem,
	Divider,
	EmptyState,
	ErrorState,
	Flex,
	Form,
	Heading,
	Image,
	Input,
	LineChart,
	LoadingSpinner,
	Panel,
	PanelBody,
	Select,
	TextArea,
	Link,
	Statistics,
	StatisticsItem,
	StatisticsTrend,
	Tag,
	Text,
	Tile,
} from "@hubspot/ui-extensions";
import {
	HeaderActions,
	PrimaryHeaderActionButton,
	SecondaryHeaderActionButton,
} from "@hubspot/ui-extensions/pages/home";

const baseApiUrl = "https://whatsapp-integration.transfunnel.io/api";

const guides = {
	setup: "https://whatsapp-integration.transfunnel.io/install-guide.php",
	templates: "https://whatsapp-integration.transfunnel.io/templates-guide.php",
};

const messageStatusVariantMap: Record<string, any> = {
	Delivered: "success",
	Read: "success",
	Sent: "default",
	Undelivered: "warning",
	Queued: "warning",
	Failed: "error",
	Accepted: "info",
};

interface FormValues {
	name: string;
	email: string;
	reason: string;
	message: string;
	[key: string]: string;
}

interface AllData {
	messages: any[] | null;
	senders: any[] | null;
	counts: any | null;
	trends: any[] | null;
	templateUsage: any | null;
}

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

interface PageContext {
	user?: {
		firstName?: string;
		lastName?: string;
		email?: string;
	};
	portal?: {
		id?: string | number;
	};
}

interface PageActions {
	addAlert?: (alert: { title: string; message: string; type?: string }) => void;
	closeOverlay?: (id: string) => void;
}

const NewHomesPage = ({ context, actions }: { context: PageContext; actions?: PageActions }) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [formValues, setFormValues] = useState<FormValues>({
		name: `${context.user?.firstName || ""} ${context.user?.lastName || ""}`.trim(),
		email: context.user?.email || "",
		reason: "",
		message: "",
	});
	const [allData, setAllData] = useState<AllData>({
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

	// update form defaults when context.user changes
	useEffect(() => {
		if (context?.user) {
			setFormValues((prev) => ({
				...prev,
				name: `${context.user?.firstName || ""} ${context.user?.lastName || ""}`.trim(),
				email: context.user?.email || "",
			}));
		}
	}, [context.user]);

	const handleFormSubmit = async (): Promise<void> => {
		const errors: Record<string, string> = {};
		if (!formValues.name) errors.name = "Name is required";
		if (!formValues.email) {
			errors.email = "Email is required";
		} else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formValues.email)) {
			errors.email = "Enter a valid email address";
		}
		if (!formValues.reason) errors.reason = "Reason is required";
		if (!formValues.message) errors.message = "Message is required";

		const valid = Object.keys(errors).length === 0;
		if (!valid) {
			const title = Object.values(errors).includes("Enter a valid email address")
				? "Invalid Email Format!"
				: "Missing Required Fields!";
			if (actions?.addAlert) {
				actions.addAlert({
					title,
					message: Object.values(errors).join("\n"),
					type: "warning",
				});
			}
			return;
		}

		try {
			const response = await hubspot.fetch(`${baseApiUrl}/support.php`, {
				timeout: 2000,
				method: "POST",
				body: formValues,
			});

			if (!response.ok) throw new Error("Submission failed");

			if (response.status == 200) {
				setFormValues({
					name: `${context.user?.firstName || ""} ${context.user?.lastName || ""}`.trim(),
					email: context.user?.email || "",
					reason: "",
					message: "",
				});
				if (actions?.closeOverlay) actions.closeOverlay("panel-contact-form");
				if (actions?.addAlert)
					actions.addAlert({
						title: "Support request submitted!",
						message: "Thank you! Our team will contact you soon.",
						type: "success",
					});
			} else {
				if (actions?.addAlert)
					actions.addAlert({
						title: "Undefined error!",
						message: "An undefined error has occurred. Please try again later.",
						type: "danger",
					});
			}
		} catch (err) {
			if (actions?.addAlert)
				actions.addAlert({
					title: "Failed to submit support request!",
					message: "Please try again later.",
					type: "danger",
				});
			console.error(err);
		}
	};

	// Helper function to check if data is empty
	const isEmpty = (data: any): boolean =>
		!data || (Array.isArray(data) && data.length === 0) || (typeof data === "object" && Object.keys(data).length === 0);

	// Helper function to render tile content based on loading/error/data state
	const renderTileContent = (data: any, emptyMessage: string, children: React.ReactNode): React.ReactNode => {
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
			<HeaderActions>
				<PrimaryHeaderActionButton
					overlay={
						<Panel variant="modal" id="panel-contact-form" title="Contact Support" aria-label="Contact Support">
							<PanelBody>
								<Text>
									Need help? Submit your query using the form below and our support team will get in touch with you
									shortly.
								</Text>
								<Form autoComplete="off" onSubmit={handleFormSubmit}>
									<Input
										label="Name"
										name="name"
										placeholder="Enter your name..."
										value={formValues.name}
										onChange={(val) => setFormValues((prev) => ({ ...prev, name: val }))}
										required
									/>
									<Input
										label="Email"
										name="email"
										type="text"
										placeholder="your@email.com"
										value={formValues.email}
										onChange={(val) => setFormValues((prev) => ({ ...prev, email: val }))}
										required
									/>
									<Select
										name="reason"
										label="Support Reason"
										value={formValues.reason}
										onChange={(val) => setFormValues((prev) => ({ ...prev, reason: String(val || "") }))}
										options={[
											{ label: "Select a reason", value: "" },
											{ label: "Billing or Payment Issue", value: "billing" },
											{ label: "Request a New Feature", value: "feature" },
											{ label: "Bug or Technical Problem", value: "technical" },
											{ label: "Account or Access Issue", value: "account" },
											{ label: "Other", value: "other" },
										]}
										required
									/>
									<TextArea
										rows={6}
										name="message"
										label="Message"
										resize="none"
										placeholder="Describe your issue in as much detail as possible..."
										maxLength={1600}
										value={formValues.message}
										onChange={(val) => setFormValues((prev) => ({ ...prev, message: String(val || "") }))}
										required
									/>
									<Divider />
									<Button type="submit" size="md" variant="primary">
										Submit
									</Button>
								</Form>
							</PanelBody>
						</Panel>
					}
				>
					Contact Support
				</PrimaryHeaderActionButton>
				<SecondaryHeaderActionButton
					href={{
						url: `${guides.setup}?portalId=${encodeURIComponent(String(context.portal?.id || ""))}`,
						external: true,
					}}
				>
					View Installation Guide
				</SecondaryHeaderActionButton>
				<SecondaryHeaderActionButton
					href={{
						url: guides.templates,
						external: true,
					}}
				>
					View Templates Guide
				</SecondaryHeaderActionButton>
			</HeaderActions>
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
											<Accordion key={index} title={itemTitle} size="md">
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
																<Tag
																	variant={
																		(messageStatusVariantMap as Record<string, any>)[message.message_status] ||
																		"default"
																	}
																>
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
													{message.associated_object_id && (
														<Link
															href={{
																url: `https://app.hubspot.com/contacts/${encodeURIComponent(
																	String(context.portal?.id || "")
																)}/record/0-1/${encodeURIComponent(String(message.associated_object_id))}`,
																external: true,
															}}
														>
															View Contact
														</Link>
													)}
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
										data={allData.senders || []}
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

hubspot.extend<"home">(({ context, actions }: { context: PageContext; actions: any }) => {
	return <NewHomesPage context={context} actions={actions} />;
});
