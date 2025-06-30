// filepath: /serverless/crm-card.js
export default async (context, sendResponse) => {
	const params = context.params;
	const query = Object.entries(params)
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
		.join("&");

	const phpUrl = `https://whatsapp-integration.transfunnel.io/react/crm-card-react.php?${query}`;

	try {
		const res = await fetch(phpUrl);
		const data = await res.json();
		sendResponse({
			statusCode: 200,
			body: data,
		});
	} catch (error) {
		sendResponse({
			statusCode: 500,
			body: { error: "Failed to fetch data from PHP endpoint." },
		});
	}
};
