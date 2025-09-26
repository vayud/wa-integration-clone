import { useState, useEffect } from "react";
import {
  hubspot,
  Tabs,
  Tab,
  LoadingSpinner,
  ErrorState,
  EmptyState,
  Text,
} from "@hubspot/ui-extensions";
import MessagesTab from "./RecentMessages";
import SendersTab from "./MessageSenders";
import StatsTab from "./StatsTab";
import TrendsTab from "./TrendsTab";
import DistributionTab from "./DistributionTab";

const TABS_CONFIG = [
  {
    id: "messages",
    title: "Recent Messages",
    tooltip: "View the last 5 messages sent/received for this contact",
    action: "recent-messages",
    responseKey: "messages",
    Component: MessagesTab,
  },
  {
    id: "senders",
    title: "Message Senders",
    tooltip: "View a breakdown of messages sent by user or workflow.",
    action: "message-senders",
    responseKey: "senders",
    Component: SendersTab,
  },
  {
    id: "stats",
    title: "Stats",
    tooltip: "View message statistics for this contact",
    action: "monthly-counts",
    responseKey: "stats",
    Component: StatsTab,
  },
  {
    id: "trends",
    title: "Trends",
    tooltip: "View monthly message trends for this contact",
    action: "monthly-trends",
    responseKey: "trends",
    Component: TrendsTab,
  },
  {
    id: "distribution",
    title: "Template Usage",
    tooltip: "View template usage distribution for this contact",
    action: "template-types",
    responseKey: "distribution",
    Component: DistributionTab,
  },
];

const initialTabData = Object.fromEntries(
  TABS_CONFIG.map(tab => [tab.id, { loading: false, data: null, error: null }])
);

const buildQuery = (params) =>
  Object.entries(params)
    .filter(([_, val]) => val != null && val !== "")
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    .join("&");

const CombinedCard = ({ context }) => {
  const [selectedTab, setSelectedTab] = useState(TABS_CONFIG[0].id);
  const [tabData, setTabData] = useState(initialTabData);

  const fetchTabData = async (key) => {
    const tabConf = TABS_CONFIG.find(tab => tab.id === key);
    if (!tabConf) return;
    setTabData(prev => ({
      ...prev,
      [key]: { loading: true, data: null, error: null },
    }));

    try {
      const url = `https://whatsapp-integration.transfunnel.io/api/contact-stats.php?${buildQuery({
        action: tabConf.action,
        associatedObjectId: context.crm.objectId,
      })}`;
      const res = await hubspot.fetch(url, { timeout: 2000 });
      const json = await res.json();
      if (json.status === "error" || !json[tabConf.responseKey]) {
        setTabData(prev => ({
          ...prev,
          [key]: { loading: false, data: null, error: json.message || "Invalid data" },
        }));
      } else if (json.status === "empty") {
        setTabData(prev => ({
          ...prev,
          [key]: { loading: false, data: "empty", error: json.message },
        }));
      } else {
        setTabData(prev => ({
          ...prev,
          [key]: { loading: false, data: json[tabConf.responseKey], error: null },
        }));
      }
    } catch (err) {
      setTabData(prev => ({
        ...prev,
        [key]: { loading: false, data: null, error: "Fetch failed" },
      }));
    }
  };

  // On mount or on context change, fetch default tab
  useEffect(() => {
    fetchTabData(TABS_CONFIG[0].id);
    setSelectedTab(TABS_CONFIG[0].id);
  }, [context.crm.objectId]);

  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
    if (!tabData[tabId].data && !tabData[tabId].loading) {
      fetchTabData(tabId);
    }
  };

  const renderTabContent = (key, Component) => {
    const { loading, data, error } = tabData[key];
    if (selectedTab !== key && !data && !loading && !error) return null;
    if (loading)
      return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
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
    <>
      <Tabs defaultSelected={TABS_CONFIG[0].id} onSelectedChange={handleTabChange}>
        {TABS_CONFIG.map(tab => (
          <Tab
            key={tab.id}
            tabId={tab.id}
            title={tab.title}
            tooltip={tab.tooltip}
            tooltipPlacement="bottom"
          />
        ))}
      </Tabs>
      {TABS_CONFIG.map(tab =>
        selectedTab === tab.id && renderTabContent(tab.id, tab.Component)
      )}
    </>
  );
};

hubspot.extend(({ context }) => <CombinedCard context={context} />);
export default CombinedCard;
