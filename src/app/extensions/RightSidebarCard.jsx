import React from "react";
import { hubspot, Card, Heading, Text, Flex, Tag, Button, Dropdown, Link, Divider } from "@hubspot/ui-extensions";

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
	<Flex direction="column" gap="md">
		<Card>
			<Flex direction="column" gap="xs">
				<Heading>WhatsApp Integration</Heading>
				<Flex align="center" gap="xs">
					<Text weight="bold">Subscription Status:</Text>
					<Tag color="success">Active</Tag>
				</Flex>
				{subscriptionProps.map((prop) => (
					<Flex key={prop.label} gap="xs">
						<Text weight="bold">{prop.label}:</Text>
						<Text>{prop.label === "Amount" ? `$${prop.value}` : prop.value}</Text>
					</Flex>
				))}
			</Flex>
		</Card>

		{guides.map((guide) => (
			<Card key={guide.title}>
				<Flex direction="column" gap="xxs">
					<Link href={guide.link} target="_blank">
						<Text weight="bold" color="primary">
							{guide.title}
						</Text>
					</Link>
					<Text size="small">{guide.description}</Text>
				</Flex>
			</Card>
		))}

		<Flex gap="sm">
			<Button
				type="iframe"
				href="https://whatsapp-integration.transfunnel.io/tw/single-send.php?userId=Mjc1MTk5MTE%3D&userEmail=dmF5dWRAdHJhbnNmdW5uZWwuY29t&associatedObjectId=MTA3Nzk1MjkwMzA1&portalId=MTQ1NjY3OTQy&firstname=VmF5dQ%3D%3D&phone=JTJCOTE3MDE0NDA1ODI3&email=dmF5dWRAdHJhbnNmdW5uZWwuY29t&lastname=RHVnYXI%3D&mobilephone=JTJCOTE4MjMzNjk5OTc5"
				iframeWidth={1080}
				iframeHeight={680}
				variant="primary"
			>
				Send WhatsApp Message
			</Button>
			<Dropdown
				label="Actions"
				options={[
					{
						label: "Conversation",
						onClick: () => {
							window.openIframe({
								url: "https://whatsapp-integration.transfunnel.io/chats.php?userId=Mjc1MTk5MTE%3D&userEmail=dmF5dWRAdHJhbnNmdW5uZWwuY29t&associatedObjectId=MTA3Nzk1MjkwMzA1&portalId=MTQ1NjY3OTQy&firstname=VmF5dQ%3D%3D&phone=JTJCOTE3MDE0NDA1ODI3&email=dmF5dWRAdHJhbnNmdW5uZWwuY29t&lastname=RHVnYXI%3D&mobilephone=JTJCOTE4MjMzNjk5OTc5&app=VHdpbGlv&ver=1750928964",
								width: 767,
								height: 800,
							});
						},
					},
					{
						label: "Settings",
						onClick: () => {
							window.openIframe({
								url: "https://whatsapp-integration.transfunnel.io/customer-portal.php?id=798866b115132b12514bd6e4bf838603e4228081f09eec5a45e97f21",
								width: 800,
								height: 480,
							});
						},
					},
				]}
			/>
		</Flex>

		<Divider />

		<Flex align="center" gap="xs">
			<Link
				href="https://whatsapp-integration.transfunnel.io/customer-portal.php?id=798866b115132b12514bd6e4bf838603e4228081f09eec5a45e97f21"
				target="_blank"
				size="small"
				weight="bold"
			>
				Settings
			</Link>
		</Flex>
	</Flex>
));
