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
export const STATUS_VARIANT_MAP: Record<string, "success" | "error" | "info" | "warning" | "default"> = {
	Active: "success",
	Cancelled: "error",
	Trialing: "info",
	Paused: "warning",
	Inactive: "default",
};
