import { useState, useEffect } from "react";
import { hubspot, Tabs, Tab, LoadingSpinner, ErrorState, EmptyState, Text } from "@hubspot/ui-extensions";
import StatsTab from "./StatsTab";
import TrendsTab from "./TrendsTab";
import DistributionTab from "./DistributionTab";

const CombinedCard = ({ context }) => {
	const [selectedTab, setSelectedTab] = useState("stats");

	const [tabData, setTabData] = useState({
		stats: { loading: true, data: null, error: null },
		trends: { loading: false, data: null, error: null },
		distribution: { loading: false, data: null, error: null },
	});

	const buildQuery = (params) =>
		Object.entries(params)
			.filter(([_, val]) => val != null && val !== "")
			.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
			.join("&");

	const fetchTabData = async (key, action) => {
		setTabData((prev) => ({
			...prev,
			[key]: { loading: true, data: null, error: null },
		}));

		try {
			const url = `https://whatsapp-integration.transfunnel.io/api/contact-stats.php?${buildQuery({
				action,
				associatedObjectId: context.crm.objectId,
			})}`;
			const res = await hubspot.fetch(url, { timeout: 2000 });
			const json = await res.json();

			if (json.status === "error" || !json[key]) {
				setTabData((prev) => ({
					...prev,
					[key]: { loading: false, data: null, error: json.message || "Invalid data" },
				}));
			} else if (json.status === "empty") {
				setTabData((prev) => ({
					...prev,
					[key]: { loading: false, data: "empty", error: json.message },
				}));
			} else {
				setTabData((prev) => ({
					...prev,
					[key]: { loading: false, data: json[key], error: null },
				}));
			}
		} catch (err) {
			setTabData((prev) => ({
				...prev,
				[key]: { loading: false, data: null, error: "Fetch failed" },
			}));
		}
	};

	// Fetch initial tab on mount
	useEffect(() => {
		fetchTabData("stats", "monthly-counts");
	}, []);

	const handleTabChange = (tabId) => {
		setSelectedTab(tabId);

		const actionMap = {
			stats: "monthly-counts",
			trends: "monthly-trends",
			distribution: "template-types",
		};

		if (!tabData[tabId].data && !tabData[tabId].loading) {
			fetchTabData(tabId, actionMap[tabId]);
		}
	};

	const renderTabContent = (key, Component) => {
		const { loading, data, error } = tabData[key];
		if (loading) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
		if (error) return <ErrorState title="Error" message={error} />;
		if (data === "empty")
			return (
				<EmptyState title="No Data">
					<Text>{error}</Text>
				</EmptyState>
			);
		return <Component data={data} />;
	};

	return (
		<Tabs defaultSelected="stats" selected={selectedTab} onSelectedChange={handleTabChange} variant="default">
			<Tab tabId="stats" title="Stats" tooltip="Monthly WhatsApp message stats">
				{renderTabContent("stats", StatsTab)}
			</Tab>
			<Tab tabId="trends" title="Trends" tooltip="Message trend over time">
				{renderTabContent("trends", TrendsTab)}
			</Tab>
			<Tab tabId="distribution" title="Distribution" tooltip="Message type distribution">
				{renderTabContent("distribution", DistributionTab)}
			</Tab>
		</Tabs>
	);
};

hubspot.extend(({ context }) => <CombinedCard context={context} />);
export default CombinedCard;
