import React, { useState } from "react";
import { Tabs, Tab } from "@hubspot/ui-extensions";
import { hubspot } from "@hubspot/ui-extensions";

import RecentMessagesTab from "./tabs/RecentMessages";
import MessageStatsTab from "./tabs/MessageStats";
import MessageSendersTab from "./tabs/MessageSenders";
import MessageTrendsTab from "./tabs/MessageTrends";
import TemplateDistributionTab from "./tabs/TemplateDistribution";

const TABS_CONFIG = [
	{
		id: "recent-messages",
		title: "Recent Messages",
		tooltip: "View the last 5 messages sent/received for this contact",
		Component: RecentMessagesTab,
		active: true,
	},
	{
		id: "message-senders",
		title: "Message Senders",
		tooltip: "View a breakdown of messages sent by user or workflow",
		Component: MessageSendersTab,
		active: true,
	},
	{
		id: "message-stats",
		title: "Statistics",
		tooltip: "View message statistics for this contact",
		Component: MessageStatsTab,
		active: true,
	},
	{
		id: "message-trends",
		title: "Trends",
		tooltip: "View monthly message trends for this contact",
		Component: MessageTrendsTab,
		active: true,
	},
	{
		id: "template-distribution",
		title: "Template Usage",
		tooltip: "View template usage distribution for this contact",
		Component: TemplateDistributionTab,
		active: true,
	},
];

// Filter only active tabs
const activeTabs = TABS_CONFIG.filter((tab) => tab.active);

hubspot.extend<"crm.record.tab">(({ context }) => <Extension context={context} />);

const Extension = ({ context }: any) => {
	const [selectedTab, setSelectedTab] = useState<string>(activeTabs[0]?.id || "");

	return (
		<Tabs variant="default" selected={selectedTab} onSelectedChange={(tabId: string) => setSelectedTab(tabId)}>
			{activeTabs.map((tab) => (
				<Tab key={tab.id} tabId={tab.id} title={tab.title} tooltip={tab.tooltip} tooltipPlacement="bottom">
					<tab.Component context={context} isSelected={selectedTab === tab.id} />
				</Tab>
			))}
		</Tabs>
	);
};
