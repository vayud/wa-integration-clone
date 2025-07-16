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
		<Flex direction="column" gap="xs">
			{data.map((message, index) => {
				var itemTitle =
					message.action === "sent" ? `Message Sent | ${message.timestamp}` : `Message Received | ${message.timestamp}`;
				return (
					<Accordion title={itemTitle}>
						<Text> {message.message} </Text>
						{message.type == "image" && message.media_url && <Image alt="Image" src={message.media_url} />}
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
