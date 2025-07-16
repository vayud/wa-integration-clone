import { useState, useEffect } from "react";
import { hubspot, Tabs, Tab, LoadingSpinner, ErrorState, EmptyState, Text } from "@hubspot/ui-extensions";
import StatsTab from "./StatsTab";
import TrendsTab from "./TrendsTab";
import MessagesTab from "./RecentMessages";
import DistributionTab from "./DistributionTab";

const CombinedCard = ({ context }) => {
	const [selectedTab, setSelectedTab] = useState("stats");

	const [tabData, setTabData] = useState({
		stats: { loading: true, data: null, error: null },
		trends: { loading: false, data: null, error: null },
		distribution: { loading: false, data: null, error: null },
		messages: { loading: false, data: null, error: null },
	});

	const buildQuery = (params) =>
		Object.entries(params)
			.filter(([_, val]) => val != null && val !== "")
			.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
			.join("&");

	const fetchTabData = async (key, action) => {
		const responseKeyMap = {
			stats: "stats",
			trends: "trends",
			distribution: "distribution",
			messages: "messages",
		};

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

			const resKey = responseKeyMap[key];

			if (json.status === "error" || !json[resKey]) {
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
					[key]: { loading: false, data: json[resKey], error: null },
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
			messages: "recent-messages",
		};

		if (!tabData[tabId].data && !tabData[tabId].loading) {
			fetchTabData(tabId, actionMap[tabId]);
		}
	};

	const renderTabContent = (key, Component) => {
		const { loading, data, error } = tabData[key];

		// Only render if this tab is selected OR already has data
		if (selectedTab !== key && !data && !loading && !error) return null;

		if (loading) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
		if (error) return <ErrorState title="Error" message={error} />;
		if (data === "empty")
			return (
				<EmptyState title="No Data">
					<Text>{error}</Text>
				</EmptyState>
			);

		// console.log("renderTabContent", key, { loading, data, error });

		return <Component data={data} />;
	};

	return (
		<>
			<Tabs defaultSelected="messages" onSelectedChange={handleTabChange}>
				<Tab tabId="messages" title="Recent Messages" tooltip="View the last 5 messages sent/received for this contact" tooltipPlacement="bottom" />
				<Tab tabId="stats" title="Stats" tooltip="View message statistics for this contact" tooltipPlacement="bottom" />
				<Tab tabId="trends" title="Trends" tooltip="View monthly message trends for this contact" tooltipPlacement="bottom" />
				<Tab tabId="distribution" title="Template Usage" tooltip="View template usage distribution for this contact" tooltipPlacement="bottom" />
			</Tabs>

			{/* ACTUALLY RENDER the selected tab content */}
			{selectedTab === "messages" && renderTabContent("messages", MessagesTab)}
			{selectedTab === "stats" && renderTabContent("stats", StatsTab)}
			{selectedTab === "trends" && renderTabContent("trends", TrendsTab)}
			{selectedTab === "distribution" && renderTabContent("distribution", DistributionTab)}
		</>
	);
};

hubspot.extend(({ context }) => <CombinedCard context={context} />);
export default CombinedCard;
