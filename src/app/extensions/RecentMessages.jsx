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

const MessagesTab = ({ data }) => {
	console.log("messages data: ", data);
	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
	if (data.error) return <ErrorState title="Something went wrong." message={data.error} />;
	if (data.empty)
		return (
			<EmptyState title="No messages yet" layout="vertical" reverseOrder={true}>
				<Text>{data.message}</Text>
			</EmptyState>
		);

	return (
		<Flex direction="column" gap="sm">
			{data.map((message, index) => {
				var itemTitle =
					message.action === "sent" ? `Message Sent | ${message.timestamp}` : `Message Received | ${message.timestamp}`;
				return (
					<Accordion title={itemTitle}>
						<Text> {message.message} </Text>
						{message.type == "image" && message.media_url && <Image alt="Image" src={message.media_url} />}
						<Divider />
						<DescriptionList direction="row" gap="sm">
							<DescriptionListItem label="Message Status">
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
					</Accordion>
				);
			})}
		</Flex>
	);

	// return (
	// 	<Flex direction="column" gap="md">
	// 		{data.map((message, index) => {
	// 			const title =
	// 				message.action === "sent"
	// 					? `Sent: ${formatTimestamp(message.timestamp)}`
	// 					: `Received: ${formatTimestamp(message.timestamp)}`;
	// 			return (
	// 				<Accordion key={index} label={title}>
	// 					<Flex direction="column" gap="sm">
	// 						{message.campaign && (
	// 							<Text variant="caption" color="secondary">
	// 								Campaign: {message.campaign}
	// 							</Text>
	// 						)}

	// 						<Text>{message.message}</Text>

	// 						{message.template_items && (
	// 							<Text variant="caption">Template Items: {JSON.stringify(message.template_items)}</Text>
	// 						)}

	// 						{message.media_url && (
	// 							<Text variant="caption">
	// 								Media URL:{" "}
	// 								<a href={message.media_url} target="_blank" rel="noopener noreferrer">
	// 									{message.media_url}
	// 								</a>
	// 							</Text>
	// 						)}

	// 						<Flex justify="between">
	// 							<Text variant="caption">Status: {message.message_status || "N/A"}</Text>
	// 							<Text variant="caption">Sent By: {message.sent_by}</Text>
	// 						</Flex>
	// 					</Flex>
	// 				</Accordion>
	// 			);
	// 		})}
	// 	</Flex>
	// );
};

export default MessagesTab;
