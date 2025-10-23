import {
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

const MessagesTab = ({ data, error }) => {
	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;

	if (error) return <ErrorState title="Something went wrong." message={error} />;

	if (data.empty)
		return (
			<EmptyState title="No messages yet" layout="vertical" reverseOrder={true}>
				<Text>{data.message}</Text>
			</EmptyState>
		);

	return (
		<Flex direction="column" gap="xs">
			{data.map((message, index) => {
				var itemTitle =
					message.action === "sent" ? `Message Sent | ${message.timestamp}` : `Message Received | ${message.timestamp}`;
				return (
					<Accordion title={itemTitle}>
						<Flex direction="column" gap="sm" justify="center" align="center">
							{/* <Text> {message.message} </Text> */}
							<Flex wrap="wrap" gap="xs" align="baseline">
								{formatMessageComponents(message.message)}
							</Flex>
							{message.media_type == "image" && message.media_url && <Image alt="Image" src={message.media_url} />}
						</Flex>
						{message.action === "sent" && (
							<>
								<Divider />
								<DescriptionList direction="row" gap="sm">
									<DescriptionListItem label="Status">
										<Tag variant={STATUS_VARIANT_MAP[message.message_status] || "default"}>
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

export default MessagesTab;

const formatMessageComponents = (input) => {
	if (!input) return <Text />;

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
