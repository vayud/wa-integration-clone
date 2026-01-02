import { useState, useEffect } from "react";
import {
	hubspot,
	Accordion,
	DescriptionList,
	DescriptionListItem,
	Divider,
	EmptyState,
	ErrorState,
	Flex,
	Image,
	LoadingSpinner,
	Tag,
	Text,
} from "@hubspot/ui-extensions";

const baseUrl = "https://whatsapp-integration.transfunnel.io/api/contact-stats.php";

// Mapping for message_status to Tag variant
const STATUS_VARIANT_MAP: Record<string, string> = {
	Accepted: "info",
	Delivered: "success",
	Failed: "danger",
	Read: "success",
	Sent: "default",
	Undelivered: "warning",
	Queued: "warning",
};

const RecentMessagesTab = ({ context, isSelected }: any) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [hasFetched, setHasFetched] = useState(false);

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
				const endpoint = `${baseUrl}?action=recent-messages&associatedObjectId=${context.crm.objectId}`;

				const response = await hubspot.fetch(endpoint, {
					method: "GET",
				});
				const result = await response.json();

				if (result.status === "empty") {
					setData({ empty: true, message: result.message });
					setHasFetched(true);
				} else if (result.status === "error" || !result.messages) {
					setError(result.message || "Invalid data");
					setHasFetched(true);
				} else {
					setData(result.messages);
					setHasFetched(true);
				}
			} catch (err) {
				console.error("Error fetching recent messages:", err);
				setError("Failed to load messages");
				setHasFetched(true);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [isSelected, context.crm.objectId]);

	if (!isSelected) {
		return null;
	}

	return (
		<Flex direction="column" gap="xs">
			{loading && <LoadingSpinner layout="centered" size="sm" label="Loading..." />}

			{!loading && data?.empty && (
				<EmptyState title="No messages yet" layout="vertical" reverseOrder={true}>
					<Text>{data.message}</Text>
				</EmptyState>
			)}

			{!loading && error && (
				<ErrorState title="Something went wrong." type="error">
					<Text>{error}</Text>
				</ErrorState>
			)}

			{!loading && !error && !data && <Text>Loading...</Text>}

			{!loading && !error && data && Array.isArray(data) && data.length === 0 && (
				<EmptyState title="No messages yet" layout="vertical">
					<Text>No recent messages to display</Text>
				</EmptyState>
			)}

			{!loading &&
				!error &&
				data &&
				Array.isArray(data) &&
				data.length > 0 &&
				data.map((message: any, index: any) => {
					var itemTitle =
						message.action === "sent"
							? `Message Sent | ${message.timestamp}`
							: `Message Received | ${message.timestamp}`;
					return (
						<Accordion key={index} size="sm" title={itemTitle}>
							<Flex direction="column" gap="xs" justify="center" align="center">
								<Flex wrap="wrap" gap="flush" align="baseline">
									{formatMessageComponents(message.message)}
								</Flex>
								{message.media_type == "image" && message.media_url && <Image alt="Image" src={message.media_url} />}
							</Flex>
							{message.action === "sent" && (
								<>
									<Divider />
									<DescriptionList direction="row">
										<DescriptionListItem label="Status">
											<Tag variant={(STATUS_VARIANT_MAP[message.message_status as string] || "default") as any}>
												{message.message_status || "N/A"}
											</Tag>
										</DescriptionListItem>
										<DescriptionListItem label="Campaign">
											<Text>{message.campaign || "N/A"}</Text>
										</DescriptionListItem>
										<DescriptionListItem label="Sent By">
											<Text>{message.sent_by || "N/A"}</Text>
										</DescriptionListItem>
									</DescriptionList>
								</>
							)}
						</Accordion>
					);
				})}
		</Flex>
	);
};

export default RecentMessagesTab;

const formatMessageComponents = (input: any) => {
	const regex = /```.*?```|`.*?`|(?<!\w)([*_~])(.+?)\1(?!\w)|> .+|([^*_~`>]+)/gms;
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
