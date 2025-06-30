import React from "react";
import {
	hubspot,
	Card,
	Heading,
	Text,
	Flex,
	Tag,
	Box,
	Button,
	ButtonRow,
	Dropdown,
	Tile,
	Modal,
	ModalBody,
	ModalFooter,
	Link,
	Divider,
} from "@hubspot/ui-extensions";

const subscriptionProps = [
	{ label: "Billing Period", value: "Perpetual" },
	{ label: "Amount", value: "$432.00" },
];

const guides = [
	{
		title: "Integration Setup Guide",
		description: "Setup Guide for WhatsApp Integration",
		link: "https://whatsapp-integration.transfunnel.io/install-guide.php?portalId=145667942",
	},
	{
		title: "Templates Guide",
		description: "Templates Guide for Twilio Content Template Builder",
		link: "https://whatsapp-integration.transfunnel.io/templates-guide.php",
	},
];

hubspot.extend(() => (
	<Flex direction={"column"} gap={"md"}>
		<Flex direction={"column"} gap={"md"}>
			<Tile compact={true}>
				<Flex align="center" gap="xs">
					<Text format={{ fontWeight: "bold" }}>Subscription Status:</Text>
					<Tag variant="success">Active</Tag>
				</Flex>
				{subscriptionProps.map((prop) => (
					<Flex key={prop.label} gap="xs">
						<Text format={{ fontWeight: "bold" }}>{prop.label}:</Text>
						<Text>{prop.value}</Text>
					</Flex>
				))}
			</Tile>
			{guides.map((guide) => (
				<Tile compact={true}>
					<Link href={guide.link} target="_blank">
						{guide.title}
					</Link>
				</Tile>
			))}
			<Tile compact={true}>
				<Link
					href="https://whatsapp-integration.transfunnel.io/customer-portal.php?id=798866b115132b12514bd6e4bf838603e4228081f09eec5a45e97f21"
					target="_blank"
				>
					Manage Subscription
				</Link>
			</Tile>
		</Flex>

		<Flex direction={"row"} gap={"sm"} justify={"center"}>
			<ButtonRow
				dropDownButtonOptions={{
					size: "sm",
				}}
			>
				<Button
					size={"sm"}
					type={"button"}
					variant={"primary"}
					overlay={
						<Modal id="default-modal" title="Send WhatsApp Message" aria-label="Send WhatsApp Message" width={"large"}>
							<ModalBody>
								<Text>Welcome to my modal. Thanks for stopping by!</Text>
							</ModalBody>
							<ModalFooter>
								<Flex justify={"between"} gap={"md"}>
									<Text format={{ fontWeight: "bold" }}> Transfunnel Consulting </Text>
									<Text format={{ fontWeight: "bold" }}> All Rights Reserved &copy; 2025 </Text>
								</Flex>
							</ModalFooter>
						</Modal>
					}
				>
					Send WhatsApp Message
				</Button>

				<Button size={"sm"} type={"button"} variant={"secondary"}>
					View Conversation
				</Button>
			</ButtonRow>
		</Flex>
	</Flex>
));
