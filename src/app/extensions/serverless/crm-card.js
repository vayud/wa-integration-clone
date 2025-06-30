// filepath: /serverless/crm-card.js
export default async (context, sendResponse) => {
	// You can access query params via context.params
	// Example: const { userId, portalId } = context.params;
	// Build your response object here
	sendResponse({
		statusCode: 200,
		body: {
			// ...your card data here...
		},
	});
};
