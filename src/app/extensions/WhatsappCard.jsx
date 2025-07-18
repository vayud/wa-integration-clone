import { useState } from "react";
import { useEffect } from "react";
import {
	hubspot,
	Button,
	ButtonRow,
	Divider,
	ErrorState,
	Flex,
	Form,
	Input,
	Link,
	LoadingSpinner,
	Panel,
	PanelBody,
	Select,
	Tag,
	Text,
	TextArea,
	Tile,
} from "@hubspot/ui-extensions";

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
	const [formValues, setFormValues] = useState({
		name: `${context.user.firstName || ""} ${context.user.lastName || ""}`.trim(),
		email: context.user.email || "",
		reason: "",
		message: "",
	});

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

			const url = `https://whatsapp-integration.transfunnel.io/api/crm-card.php`;
			try {
				const response = await hubspot.fetch(url, {
					timeout: 2_000,
					method: "POST",
					body: params,
				});
				const data = await response.json();

				if (data.status === "error") {
					setData({ error: data.message });
					return;
				}

				setData(data[params.portalId]);
			} catch (err) {
				console.error("Something went wrong", err);
			}
		};
		fetchData();
	}, [context, contactProperties]);

	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;

	if (data && data.error) {
		return <ErrorState title="Something went wrong."></ErrorState>;
	}

	const billing = data.billing;
	const frames = data.frames;
	const guides = data.guides;

	const handleFormSubmit = async ({ values, valid }) => {
		if (!valid) return;

		console.log("Submitting form...");

		try {
			const response = await fetch("https://whatsapp-integration.transfunnel.io/api/support", {
				method: "POST",
				body: JSON.stringify(values),
			});

			if (!response.ok) throw new Error("Server error");
		} catch (err) {
			console.error("Form submission error:", err);
		}
	};

	return (
		<Flex direction="column" gap="md">
			<Flex direction="column" gap="sm">
				<Tile compact={true}>
					<Flex gap="xs">
						<Text format={{ fontWeight: "bold" }}>Subscription Status:</Text>
						<Tag variant={STATUS_VARIANT_MAP[billing.status] || "default"}>{billing.status}</Tag>
					</Flex>
					<Flex gap="xs">
						<Text format={{ fontWeight: "bold" }}>Plan:</Text>
						<Tag variant={billing.plan == "Starter" ? "default" : "info"}> {billing.plan} </Tag>
					</Flex>
					<Flex gap="xs">
						<Text format={{ fontWeight: "bold" }}>Billing Period:</Text>
						<Tag variant="default"> {billing.period} </Tag>
					</Flex>
				</Tile>

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

			<Flex direction="column" gap="md" align="center" justify="center">
				<ButtonRow dropDownButtonOptions={{ size: "sm" }}>
					<Button
						size="sm"
						type="button"
						variant="primary"
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
						size="sm"
						type="button"
						variant="secondary"
						onClick={() =>
							openIframe({
								uri: frames.conversation.url,
								title: frames.conversation.label,
								width: frames.conversation.width,
								height: frames.conversation.height,
							})
						}
					>
						{frames.conversation.label}
					</Button>
				</ButtonRow>
				<ButtonRow>
					<Button
						type="button"
						size="sm"
						variant="secondary"
						overlay={
							<Panel variant="modal" id="my-panel" title="Contact Support" aria-label="Contact Support">
								<PanelBody>
									<Form
										autoComplete="off"
										onSubmit={handleFormSubmit}
										validate={({ values }) => {
											const errors = {};
											if (!values.name) errors.name = "Name is required";
											if (!values.email) errors.email = "Email is required";
											if (values.email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(values.email))
												errors.email = "Enter a valid email";
											if (!values.reason) errors.reason = "Reason is required";
											if (!values.message) errors.message = "Message is required";
											return errors;
										}}
									>
										<Input
											label="Name"
											name="name"
											placeholder="Enter your name..."
											onChange={(val) => setFormValues((prev) => ({ ...prev, name: val }))}
											required
										/>
										<Input
											label="Email"
											name="email"
											type="text"
											placeholder="your@email.com"
											onChange={(val) => setFormValues((prev) => ({ ...prev, email: val }))}
											required
										/>
										<Select
											name="reason"
											label="Support Reason"
											options={[
												{ label: "Select a reason", value: "" },
												{ label: "Billing or Payment Issue", value: "billing" },
												{ label: "Request a New Feature", value: "feature" },
												{ label: "Bug or Technical Problem", value: "technical" },
												{ label: "Account or Access Issue", value: "account" },
												{ label: "Other", value: "other" },
											]}
											onChange={(val) => setFormValues((prev) => ({ ...prev, reason: val }))}
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
											onChange={(val) => setFormValues((prev) => ({ ...prev, message: val }))}
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
					</Button>
				</ButtonRow>
			</Flex>
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
