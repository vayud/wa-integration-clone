/**
 * Centralized property field definitions for custom CRM UI cards
 * Import and use these constants across different card components (order-sensitive)
 */

export const contactPropertiesToRetrieve = [
	"firstname", // First Name
	"lastname", // Last Name
	"email", // Email Address
	"phone", // Phone Number
	"mobilephone", // Mobile Phone Number
];

/**
 * Support form reason options
 */
export const supportReasonOptions = [
	{ label: "Select a reason", value: "" },
	{ label: "Billing or Payment Issue", value: "billing" },
	{ label: "Request a New Feature", value: "feature" },
	{ label: "Bug or Technical Problem", value: "technical" },
	{ label: "Account or Access Issue", value: "account" },
	{ label: "Other", value: "other" },
];

/**
 * Mapping for billing status to Tag variant
 */
export const statusVariantMap: Record<string, "success" | "error" | "info" | "warning" | "default"> = {
	Active: "success",
	Cancelled: "error",
	Trialing: "info",
	Paused: "warning",
	Inactive: "default",
};

/**
 * Mapping for message status to Tag variant
 */
export const messageStatusVariantMap: Record<string, "success" | "error" | "info" | "warning" | "default"> = {
	Accepted: "info",
	Delivered: "success",
	Failed: "error",
	Read: "success",
	Sent: "default",
	Undelivered: "warning",
	Queued: "warning",
};

/**
 * Guide URLs
 */
export const guides = {
	setup: "https://whatsapp-integration.transfunnel.io/install-guide.php",
	templates: "https://whatsapp-integration.transfunnel.io/templates-guide.php",
};
