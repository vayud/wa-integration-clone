import { useState } from "react";
import { useEffect } from "react";
import { hubspot, ErrorState, LoadingSpinner, Text, LineChart } from "@hubspot/ui-extensions";

// Helper to build query string
const buildQuery = (params) =>
	Object.entries(params)
		.filter(([key, val]) => val != null && val !== "")
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
		.join("&");

const TrendsCard = ({ context }) => {
	// const [data, setData] = useState(null);

	// useEffect(() => {
	// 	const fetchData = async () => {
	// 		const params = {
	// 			action: "monthly-trends",
	// 			associatedObjectId: context.crm.objectId,
	// 		};

	// 		const url = `https://whatsapp-integration.transfunnel.io/api/contact-stats.php?${buildQuery(params)}`;
	// 		try {
	// 			const response = await hubspot.fetch(url, {
	// 				timeout: 2_000,
	// 				method: "GET",
	// 			});
	// 			const data = await response.json();

	// 			if (data.status === "error") {
	// 				setData({ error: data.message });
	// 				return;
	// 			}

	// 			if (data.status === "success") {
	// 				if (data && data.stats) {
	// 					setData(data.stats);
	// 				} else {
	// 					setData({ error: "Stats not found in response" });
	// 				}
	// 			}
	// 		} catch (err) {
	// 			console.error("Something went wrong", err);
	// 		}
	// 	};
	// 	fetchData();
	// }, [context]);

	// if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;

	// if (data && data.error) {
	// 	return <ErrorState title="Something went wrong."></ErrorState>;
	// }

	const VisitsPerSourceOverTime = [
		{
			"Session Date": "2019-09-01",
			Breakdown: "Direct",
			Visits: 1277,
		},
		{
			"Session Date": "2019-09-01",
			Breakdown: "Referrals",
			Visits: 1882,
		},
		{
			"Session Date": "2019-09-01",
			Breakdown: "Email",
			Visits: 1448,
		},
		{
			"Session Date": "2019-09-02",
			Breakdown: "Direct",
			Visits: 1299,
		},
		{
			"Session Date": "2019-09-02",
			Breakdown: "Referrals",
			Visits: 1869,
		},
		{
			"Session Date": "2019-09-02",
			Breakdown: "Email",
			Visits: 1408,
		},
		{
			"Session Date": "2019-09-03",
			Breakdown: "Direct",
			Visits: 1357,
		},
		{
			"Session Date": "2019-09-03",
			Breakdown: "Referrals",
			Visits: 1931,
		},
		{
			"Session Date": "2019-09-03",
			Breakdown: "Email",
			Visits: 1391,
		},
	];

	return (
		<LineChart
			data={VisitsPerSourceOverTime}
			axes={{
				x: { field: "Session Date", fieldType: "category" },
				y: { field: "Visits", fieldType: "linear" },
				options: { groupFieldByColor: "Breakdown" },
			}}
			options={{
				showLegend: true,
				colorList: ["purple", "green", "darkBlue"],
			}}
		/>
	);
};

hubspot.extend(({ context }) => <TrendsCard context={context} />);
