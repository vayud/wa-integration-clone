import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import {
	hubspot,
	Card,
	Heading,
	Text,
	Flex,
	Tag,
	Box,
	Button,
	LoadingSpinner,
	ButtonRow,
	Dropdown,
	Tile,
	Modal,
	ModalBody,
	ModalFooter,
	Link,
	Divider,
} from "@hubspot/ui-extensions";

// Helper to build query string
const buildQuery = (params) =>
	Object.entries(params)
		.filter(([key, val]) => val != null && val !== "")
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
		.join("&");

// Mapping for billing status to Tag variant
const STATUS_VARIANT_MAP = {
	Active: "success",
	Cancelled: "danger",
	Trialing: "info",
	Paused: "warning",
	Inactive: "default",
};

const DynamicCard = ({ context, fetchCrmObjectProperties, openIframe }) => {
	const [data, setData] = useState(null);
	const [contactProperties, setContactProperties] = useState({});

	useEffect(() => {
		const loadProperties = async () => {
			try {
				const props = await fetchCrmObjectProperties(["email", "phone", "mobilephone"]);
				setContactProperties(props);
			} catch (err) {
				console.error("Error fetching CRM properties", err);
			}
		};
		loadProperties();
	}, [fetchCrmObjectProperties]);

	useEffect(() => {
		if (!contactProperties.phone && !contactProperties.mobilephone && !contactProperties.email) return;

		const fetchData = async () => {
			const params = {
				userId: context.user.id,
				userEmail: context.user.email,
				associatedObjectId: context.crm.objectId,
				associatedObjectType: context.crm.objectTypeId,
				portalId: context.portal.id,
				firstname: context.user.firstName,
				lastname: context.user.lastName,
				email: contactProperties.email,
				phone: contactProperties.phone,
				mobilephone: contactProperties.mobilephone,
			};

			const url = `https://whatsapp-integration.transfunnel.io/react/crm-card-react.php?${buildQuery(params)}`;
			try {
				const response = await hubspot.fetch(url, {
					timeout: 2_000,
					method: "GET",
				});
				const data = await response.json();
				setData(data[params.portalId]);
			} catch (err) {
				console.error("Something went wrong", err);
			}
		};
		fetchData();
	}, [context, contactProperties]);

	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;

	const billing = data.billing;
	const guides = data.guides;
	const frames = data.frames;

	return (
		<Flex direction={"column"} gap={"md"}>
			<Flex direction={"column"} gap={"md"}>
				<Tile compact={true}>
					<Flex gap="xs">
						<Text format={{ fontWeight: "bold" }}>Subscription Status:</Text>
						<Tag variant={STATUS_VARIANT_MAP[billing.status] || "default"}>{billing.status}</Tag>
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

			<Flex direction="column" gap="small">
				<Tile compact={true}>
					<Link href={guides.setup} target="_blank">
						Integration Setup Guide
					</Link>
				</Tile>
				<Tile compact={true}>
					<Link href={guides.templates} target="_blank">
						Templates Guide
					</Link>
				</Tile>
			</Flex>

			<Flex gap="md" justify={"center"}>
				<ButtonRow dropDownButtonOptions={{ size: "sm" }}>
					<Button
						size={"sm"}
						type={"button"}
						variant={"primary"}
						onClick={() =>
							openIframe({
								uri: frames.form.url,
								title: frames.form.label,
								width: frames.form.width,
								height: frames.form.height,
							})
						}
					>
						{frames.form.label}
					</Button>
					<Button
						size={"sm"}
						type={"button"}
						variant={"secondary"}
						onClick={() =>
							openIframe({
								url: frames.conversation.url,
								title: frames.conversation.label,
								width: frames.conversation.width,
								height: frames.conversation.height,
							})
						}
					>
						{frames.conversation.label}
					</Button>
				</ButtonRow>
			</Flex>

			{frames?.customerPortal?.url ? (
				<Flex direction="column" gap="small">
					<Tile compact={true}>
						<Link href={frames.customerPortal.url} target="_blank">
							{frames.customerPortal.label}
						</Link>
					</Tile>
				</Flex>
			) : (
				<></>
			)}
		</Flex>
	);
};

hubspot.extend(({ context, actions }) => (
	<DynamicCard
		context={context}
		openIframe={actions.openIframeModal}
		fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
	/>
));
