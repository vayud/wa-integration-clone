import React, { useState, useEffect } from "react";
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
import { contactPropertiesToRetrieve, supportReasonOptions, STATUS_VARIANT_MAP } from "./constants/constants";

const baseApiUrl = "https://whatsapp-integration.transfunnel.io/api";

interface ContactProperties {
	firstname?: string;
	lastname?: string;
	email?: string;
	phone?: string;
	mobilephone?: string;
}

interface CardData {
	billing: {
		period: string;
		plan: string;
		status: string;
	};
	frames: {
		form: {
			label: string;
			height: number;
			width: number;
			url: string;
		};
		conversation: {
			label: string;
			height: number;
			width: number;
			url: string;
		};
	};
	guides: {
		setup: string;
		templates: string;
	};
}

const PrimaryCard = ({ context, fetchCrmObjectProperties, openIframe, addAlert, closeOverlay }: any) => {
	const [contactProperties, setContactProperties] = useState<ContactProperties>({});
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<CardData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [hasFetched, setHasFetched] = useState(false);
	const [formValues, setFormValues] = useState({
		name: `${context.user.firstName || ""} ${context.user.lastName || ""}`.trim(),
		email: context.user.email || "",
		reason: "",
		message: "",
	});

	useEffect(() => {
		const loadProperties = async () => {
			try {
				const properties = await fetchCrmObjectProperties(contactPropertiesToRetrieve);
				setContactProperties(properties);
			} catch (err) {
				console.error("Error fetching CRM properties", err);
			}
		};
		loadProperties();
	}, [fetchCrmObjectProperties]);

	useEffect(() => {
		if (
			!contactProperties.firstname &&
			!contactProperties.email &&
			(!contactProperties.phone || !contactProperties.mobilephone)
		)
			return;
		if (hasFetched) return;

		const endpoint = `${baseApiUrl}/crm-card.php`;

		const requestPayload = {
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

		const fetchData = async () => {
			setLoading(true);

			try {
				const response = await hubspot.fetch(endpoint, {
					method: "POST",
					body: requestPayload,
				});
				const result = await response.json();

				if (result.status === "error") {
					setError(result.message || "Something went wrong");
					setHasFetched(true);
					return;
				}

				// Response is keyed by portal ID
				const portalData = result[context.portal.id];

				if (!portalData) {
					setError("No data available for this portal");
					setHasFetched(true);
				} else {
					setData(portalData);
					setHasFetched(true);
				}
			} catch (err) {
				console.error("Error fetching card data:", err);
				setError("Failed to load data");
				setHasFetched(true);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [contactProperties, hasFetched, context]);

	useEffect(() => {
		if (context?.user) {
			setFormValues((prev) => ({
				...prev,
				name: `${context.user.firstName || ""} ${context.user.lastName || ""}`.trim(),
				email: context.user.email || "",
			}));
		}
	}, [context.user]);

	if (loading) {
		return <LoadingSpinner layout="centered" size="sm" label="Loading..." />;
	}

	if (error) {
		return (
			<ErrorState title="Something went wrong." type="error">
				<Text>{error}</Text>
			</ErrorState>
		);
	}

	if (!data) {
		return null;
	}

	const handleOpenForm = () => {
		openIframe({
			uri: data.frames.form.url,
			title: data.frames.form.label,
			width: data.frames.form.width,
			height: data.frames.form.height,
			flush: true,
		});
	};

	const handleOpenConversation = () => {
		openIframe({
			uri: data.frames.conversation.url,
			title: data.frames.conversation.label,
			width: data.frames.conversation.width,
			height: data.frames.conversation.height,
		});
	};

	const handleFormSubmit = async () => {
		const errors: Record<string, string> = {};

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

		try {
			const response = await hubspot.fetch(`${baseApiUrl}/support.php`, {
				timeout: 2000,
				method: "POST",
				body: formValues,
			});

			if (!response.ok) throw new Error("Submission failed");

			if (response.status === 200) {
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
						<Tag variant={STATUS_VARIANT_MAP[data.billing.status] || "default"}>{data.billing.status}</Tag>
					</Flex>
					<Flex gap="xs">
						<Text format={{ fontWeight: "bold" }}>Plan:</Text>
						<Tag variant={data.billing.plan === "Starter" ? "default" : "info"}>{data.billing.plan}</Tag>
					</Flex>
					<Flex gap="xs">
						<Text format={{ fontWeight: "bold" }}>Billing Period:</Text>
						<Tag variant="default">{data.billing.period}</Tag>
					</Flex>
				</Tile>

				<Tile compact={true}>
					<Link href={data.guides.setup}>Integration Setup Guide</Link>
				</Tile>

				<Tile compact={true}>
					<Link href={data.guides.templates}>Templates Guide</Link>
				</Tile>
			</Flex>

			<Flex direction="column" gap="md" align="center" justify="center">
				<ButtonRow dropDownButtonOptions={{ size: "sm" }}>
					<Button size="sm" type="button" variant="primary" onClick={handleOpenForm}>
						{data.frames.form.label}
					</Button>
					<Button size="sm" type="button" variant="secondary" onClick={handleOpenConversation}>
						{data.frames.conversation.label}
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
												onChange={(val) => setFormValues((prev) => ({ ...prev, reason: String(val || "") }))}
												options={supportReasonOptions}
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

hubspot.extend<"crm.record.tab">(({ context, actions }) => (
	<PrimaryCard
		context={context}
		openIframe={actions.openIframeModal}
		fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
		addAlert={actions.addAlert}
		closeOverlay={actions.closeOverlay}
	/>
));
