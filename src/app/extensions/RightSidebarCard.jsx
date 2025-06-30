import React, { useEffect, useState } from "react";
import {
	hubspot,
	Card,
	Text,
	Flex,
	Tag,
	Button,
	ButtonRow,
	Tile,
	Modal,
	ModalBody,
	Link,
	Divider,
} from "@hubspot/ui-extensions";

// Helper to build query string
const buildQuery = (params) =>
	Object.entries(params)
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
		.join("&");

const DynamicCard = ({ context }) => {
	const [data, setData] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			const params = {
				userId: context.user.id,
				userEmail: context.user.email,
				associatedObjectId: context.crm.objectId,
				associatedObjectType: context.crm.objectTypeId,
				portalId: context.portal.id,
				firstname: context.user.firstName,
				lastname: context.user.lastName,
				phone: context.object?.properties?.phone,
				email: context.user.email,
				mobilephone: context.object?.properties?.mobilephone,
			};

			const url = `https://whatsapp-integration.transfunnel.io/react/crm-card-react.php?${buildQuery(params)}`;
			const res = await fetch(url);
			const json = await res.json();
			setData(json[params.portalId]);
		};
		fetchData();
	}, [context]);

	if (!data) return <Text>Loading...</Text>;

	const billing = data.billing;
	const guides = data.guides;
	const frames = data.frames;

	return (
		<Flex direction="column" gap="md">
			<Card>
				<Flex direction="column" gap="xs">
					<Tile compact={true}>
						<Text format={{ fontWeight: "bold" }}>WhatsApp Integration</Text>
						<Text>WhatsApp Integration by TransFunnel Consulting</Text>
						<Flex align="center" gap="xs">
							<Text format={{ fontWeight: "bold" }}>Subscription Status:</Text>
							<Tag variant={billing.status === "Active" ? "success" : "warning"}>{billing.status}</Tag>
						</Flex>
						<Flex gap="xs">
							<Text format={{ fontWeight: "bold" }}>Billing Period:</Text>
							<Text>{billing.period}</Text>
						</Flex>
						<Flex gap="xs">
							<Text format={{ fontWeight: "bold" }}>Amount:</Text>
							<Text>${billing.amount}</Text>
						</Flex>
					</Tile>
				</Flex>
			</Card>

			<Flex direction="column" gap="small">
				<Tile compact={true}>
					<Link href={guides.setup} target="_blank">
						Integration Setup Guide
					</Link>
					<Text>Setup Guide for WhatsApp Integration</Text>
				</Tile>
				<Tile compact={true}>
					<Link href={guides.templates} target="_blank">
						Templates Guide
					</Link>
					<Text>Templates Guide for Twilio Content Template Builder</Text>
				</Tile>
			</Flex>

			<Flex gap="md" justify={"center"}>
				<ButtonRow dropDownButtonOptions={{ size: "sm" }}>
					<Button
						size={"sm"}
						type={"button"}
						variant={"primary"}
						onClick={() => window.open(frames.form.url, "_blank")}
					>
						{frames.form.label}
					</Button>
					<Button
						size={"sm"}
						type={"button"}
						variant={"secondary"}
						onClick={() => window.open(frames.conversation.url, "_blank")}
					>
						{frames.conversation.label}
					</Button>
				</ButtonRow>
			</Flex>

			<Divider />

			<Flex direction="column" gap="small">
				<Tile compact={true}>
					<Link href={frames.customerPortal.url} target="_blank" size="small" format={{ fontWeight: "bold" }}>
						{frames.customerPortal.label}
					</Link>
				</Tile>
			</Flex>
		</Flex>
	);
};

hubspot.extend(({ context }) => <DynamicCard context={context} />);
