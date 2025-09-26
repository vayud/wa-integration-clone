import React, { useState, useEffect } from "react";
import {
	hubspot,
	Button,
	EmptyState,
	ErrorState,
	Flex,
	LoadingButton,
	LoadingSpinner,
	Text,
	Tile,
	Toggle,
} from "@hubspot/ui-extensions";

const baseApiUrl = "https://whatsapp-integration.transfunnel.io/api";

// Define types for better TypeScript support
interface SubscriptionData {
	plan?: string;
	status?: string;
	customerId?: string;
}

interface ErrorData {
	title: string;
	message: string;
}

interface NewSettingsPageProps {
	context: any;
	addAlert?: (alert: { title: string; message: string; type: string }) => void;
	openIframe?: (config: { uri: string; title: string; width: number; height: number }) => void;
}

const NewSettingsPage = ({ context, addAlert, openIframe }: NewSettingsPageProps) => {
	const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
	const [contactToggleState, setContactToggleState] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [updatingToggle, setUpdatingToggle] = useState<boolean>(false);
	const [error, setError] = useState<ErrorData | null>(null);

	const showAlert = (title: string, message: string, type = "info") => {
		if (addAlert) {
			addAlert({
				title,
				message,
				type,
			});
		} else {
			console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
		}
	};

	// Fetch initial data on component mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				const params = {
					userId: context.user?.id || "",
					userEmail: context.user?.email || "",
					portalId: context.portal?.id || "",
					action: "retrieveSettings",
				};

				const response = await hubspot.fetch(`${baseApiUrl}/settings.php`, {
					timeout: 5000,
					method: "POST",
					body: params,
				});

				const data = await response.json();

				if (data.status === "error") {
					setError({
						title: "Failed to load settings",
						message: data.message || "Unable to load settings data",
					});
					showAlert("Failed to load settings", data.message || "Unable to load settings data", "danger");
					return;
				}

				setSubscriptionData(data.subscription);
				setContactToggleState(data.createContactForUnknown || false);
			} catch (err) {
				console.error("Error fetching settings data", err);
				setError({
					title: "Error loading settings",
					message: "Unable to connect to settings service",
				});
				showAlert("Error loading settings", "Unable to connect to settings service", "danger");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [context]);

	// Handle manage subscription button click
	const handleCustomerPortal = async () => {
		try {
			const params = {
				portalId: context.portal?.id || "",
				action: "retrieveCustomerPortalGateway",
			};

			const response = await hubspot.fetch(`${baseApiUrl}/settings.php`, {
				timeout: 5000,
				method: "POST",
				body: params,
			});

			const data = await response.json();

			if (data.status === "error") {
				showAlert("Unable to open subscription management", data.message || "Failed to get subscription URL", "danger");
				return;
			}

			// Open the customer portal URL in iframe modal
			if (openIframe && data.url) {
				openIframe({
					uri: data.url,
					title: "Manage Subscription",
					width: 800,
					height: 400,
				});
			} else {
				showAlert("Unable to open subscription management", "No subscription URL available", "danger");
			}
		} catch (err) {
			console.error("Error retrieving customer portal endpoint", err);
			showAlert("Error opening subscription management", "Unable to connect to settings service", "danger");
		}
	};

	// Handle refresh templates button click
	const handleRefreshTemplates = async () => {
		setRefreshing(true);

		try {
			const params = {
				portalId: context.portal?.id || "",
				action: "refreshTemplates",
			};

			const response = await hubspot.fetch(`${baseApiUrl}/settings.php`, {
				timeout: 10000,
				method: "POST",
				body: params,
			});

			const data = await response.json();

			if (data.status === "success") {
				if (data.message === "No new templates added!") {
					showAlert("No new templates", "Your template list is already up to date", "info");
				} else {
					showAlert(
						"Templates Refreshed!",
						data.message || "Template library has been updated with the latest templates",
						"success"
					);
				}
			} else {
				showAlert("Failed to refresh templates", data.message || "Unable to refresh template library", "danger");
			}
		} catch (err) {
			console.error("Error refreshing templates", err);
			showAlert("Error refreshing templates", "Unable to connect to template service", "danger");
		} finally {
			setRefreshing(false);
		}
	};

	// Handle contact creation toggle change
	const handleContactToggleChange = async (newValue: boolean) => {
		setUpdatingToggle(true);

		try {
			const params = {
				portalId: context.portal?.id || "",
				action: "updateContactCreateToggle",
				createContactForUnknown: newValue,
			};

			const response = await hubspot.fetch(`${baseApiUrl}/settings.php`, {
				timeout: 5000,
				method: "POST",
				body: params,
			});

			const data = await response.json();

			if (data.status === "success") {
				setContactToggleState(newValue);
				showAlert(
					"Setting updated successfully!",
					data.message || `Contact creation for unknown Contacts ${newValue ? "enabled" : "disabled"}`,
					"success"
				);
			} else {
				showAlert("Failed to update setting", data.message || "Unable to update contact creation setting", "danger");
			}
		} catch (err) {
			console.error("Error updating contact toggle", err);
			showAlert("Error updating setting", "Unable to connect to settings service", "danger");
		} finally {
			setUpdatingToggle(false);
		}
	};

	if (loading) {
		return <LoadingSpinner layout="centered" size="md" label="Loading settings..." />;
	}

	if (error) {
		return (
			<ErrorState title={error.title}>
				<Text>{error.message}</Text>
			</ErrorState>
		);
	}

	// If no subscription data, show empty state
	if (!subscriptionData && !contactToggleState) {
		return (
			<EmptyState title="Settings not available" layout="vertical">
				<Text>Settings data is not available at this time. Please try refreshing the page.</Text>
			</EmptyState>
		);
	}

	return (
		<Flex direction="column" gap="sm">
			{/* Manage Subscription */}
			<Tile compact={true}>
				<Flex direction="row" justify="between" align="center">
					<Flex direction="column" gap="flush">
						<Text format={{ fontWeight: "bold" }}>Manage your Subscription</Text>
						<Text>View and update your contact/payment information, or cancel your subscription at any time.</Text>
					</Flex>
					<Button size="md" type="button" variant="secondary" onClick={handleCustomerPortal}>
						Manage
					</Button>
				</Flex>
			</Tile>

			{/* Create Contact Toggle */}
			<Tile compact={true}>
				<Flex direction="row" justify="between" align="center">
					<Flex direction="column" gap="flush">
						<Text format={{ fontWeight: "bold" }}>Create Contact for unknown Contacts</Text>
						<Text>
							Automatically create a new contact in HubSpot every time an unknown prospect messages you on WhatsApp
						</Text>
					</Flex>
					<Toggle
						label={contactToggleState ? "Enabled" : "Disabled"}
						checked={contactToggleState}
						onChange={handleContactToggleChange}
						readonly={updatingToggle}
					/>
				</Flex>
			</Tile>

			{/* Refresh Templates */}
			<Tile compact={true}>
				<Flex direction="row" justify="between" align="center">
					<Flex direction="column" gap="flush">
						<Text format={{ fontWeight: "bold" }}>Refresh list of Templates</Text>
						<Text>
							Retrieves the latest content templates from Twilio, ensuring the template list stays updated with the
							latest templates available for WhatsApp
						</Text>
					</Flex>
					<LoadingButton
						size="md"
						type="button"
						variant="secondary"
						onClick={handleRefreshTemplates}
						loading={refreshing}
					>
						Refresh
					</LoadingButton>
				</Flex>
			</Tile>
		</Flex>
	);
};

hubspot.extend(({ context, actions }) => {
	// @ts-ignore - addAlert and openIframeModal may not be typed for settings context but work in practice
	return <NewSettingsPage context={context} addAlert={actions?.addAlert} openIframe={actions?.openIframeModal} />;
});
