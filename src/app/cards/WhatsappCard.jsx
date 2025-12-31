import { useState, useEffect } from "react";
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
	PanelSection,
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

const baseApiUrl = "https://whatsapp-integration.transfunnel.io/api";

const DynamicCard = ({ context, fetchCrmObjectProperties, addAlert, openIframe, closeOverlay }) => {
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
				const props = await fetchCrmObjectProperties(["firstname", "lastname", "email", "phone", "mobilephone"]);
				setContactProperties(props);
			} catch (err) {
				console.error("Error fetching CRM properties", err);
			}
		};
		loadProperties();
	}, [fetchCrmObjectProperties]);

	useEffect(() => {
		if (!contactProperties.firstname && !contactProperties.email && (!contactProperties.phone || !contactProperties.mobilephone)) return;

		const fetchData = async () => {
			const params = {
				portalId: context.portal.id,
				userId: context.user.id,
				userEmail: context.user.email,
				associatedObjectId: context.crm.objectId,
				associatedObjectType: context.crm.objectTypeId,
				firstname: contactProperties.firstname,
				lastname: contactProperties.lastname,
				email: contactProperties.email,
				phone: contactProperties.phone,
				mobilephone: contactProperties.mobilephone,
			};

			const url = `${baseApiUrl}/crm-card.php`;
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

	useEffect(() => {
		if (context?.user) {
			setFormValues((prev) => ({
				...prev,
				name: `${context.user.firstName || ""} ${context.user.lastName || ""}`.trim(),
				email: context.user.email || "",
			}));
		}
	}, [context.user]);

	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;

	if (data && data.error) {
		return <ErrorState title="Something went wrong."></ErrorState>;
	}

	const billing = data.billing;
	const frames = data.frames;
	const guides = data.guides;

	const handleFormSubmit = async () => {
		const errors = {};

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
			// Determine title based on type of errors
			const title = Object.values(errors).includes("Enter a valid email address")
				? "Invalid Email Format!"
				: "Missing Required Fields!";

			addAlert({
				title,
				message: Object.values(errors).join("\n"),
				type: "warning",
			});
			return;
		}

		// Proceed with submission
		try {
			const response = await hubspot.fetch(`${baseApiUrl}/support.php`, {
				timeout: 2000,
				method: "POST",
				body: formValues,
			});

			if (!response.ok) throw new Error("Submission failed");

			if (response.status == 200) {
				setFormValues({
					name: `${context.user.firstName || ""} ${context.user.lastName || ""}`.trim(),
					email: context.user.email || "",
					reason: "",
					message: "",
				});

				closeOverlay("panel-contact-form");
				addAlert({
					title: "Support request submitted!",
					message: "Thank you! Our team will contact you soon.",
					type: "success",
				});
			} else {
				addAlert({
					title: "Undefined error!",
					message: "An undefined error has occurred. Please try again later.",
					type: "danger",
				});
			}
		} catch (err) {
			addAlert({
				title: "Failed to submit support request!",
				message: "Please try again later.",
				type: "danger",
			});
			console.error(err);
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
								flush: true
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
					<Button
						type="button"
						size="sm"
						variant="secondary"
						overlay={
							<Panel variant="default" id="panel-contact-form" title="Contact Support" aria-label="Contact Support">
								<PanelBody>
									<PanelSection>
										<Text>
											Need help? Submit your query using the form below and our team will get in touch with you.
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
												onChange={(val) => setFormValues((prev) => ({ ...prev, reason: val }))}
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
												onChange={(val) => setFormValues((prev) => ({ ...prev, message: val }))}
												required
											/>
											<Divider />
											<Button type="submit" size="md" variant="primary">
												Submit
											</Button>
										</Form>
									</PanelSection>
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
		addAlert={actions.addAlert}
		openIframe={actions.openIframeModal}
		fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
		closeOverlay={actions.closeOverlay}
	/>
));
