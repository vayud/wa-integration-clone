import { useState } from "react";
import { useEffect } from "react";
import { hubspot, Button, ButtonRow, ErrorState, Flex, LoadingSpinner } from "@hubspot/ui-extensions";

const PreviewCard = ({ context, fetchCrmObjectProperties, openIframe }) => {
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

	const frames = data.frames;

	return (
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
		</Flex>
	);
};

hubspot.extend(({ context, actions }) => (
	<PreviewCard
		context={context}
		openIframe={actions.openIframeModal}
		fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
	/>
));
