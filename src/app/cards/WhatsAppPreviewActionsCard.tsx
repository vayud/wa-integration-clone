import React, { useState, useEffect } from "react";
import { hubspot, Button, ButtonRow, ErrorState, Flex, LoadingSpinner } from "@hubspot/ui-extensions";
import { contactPropertiesToRetrieve } from "./constants/properties";

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

const PreviewCard = ({ context, fetchCrmObjectProperties, openIframe }: any) => {
	const [contactProperties, setContactProperties] = useState<ContactProperties>({});
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<CardData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [hasFetched, setHasFetched] = useState(false);

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

		const endpoint = "https://whatsapp-integration.transfunnel.io/api/crm-card.php";

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

	if (loading) {
		return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
	}

	if (error) {
		return <ErrorState title="Something went wrong.">{error}</ErrorState>;
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

	return (
		<Flex gap="md" justify="center">
			<ButtonRow dropDownButtonOptions={{ size: "sm" }}>
				<Button size="sm" type="button" variant="primary" onClick={handleOpenForm}>
					{data.frames.form.label}
				</Button>
				<Button size="sm" type="button" variant="secondary" onClick={handleOpenConversation}>
					{data.frames.conversation.label}
				</Button>
			</ButtonRow>
		</Flex>
	);
};

hubspot.extend<"crm.record.tab">(({ context, actions }) => (
	<PreviewCard
		context={context}
		openIframe={actions.openIframeModal}
		fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
	/>
));
