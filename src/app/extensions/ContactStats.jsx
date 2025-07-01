import { hubspot, Statistics, StatisticsItem, StatisticsTrend } from "@hubspot/ui-extensions";

const Extension = () => {
	return (
		<Statistics>
			<StatisticsItem label="Item A Sales" number="10000">
				<StatisticsTrend direction="decrease" value="200%" />
			</StatisticsItem>
			<StatisticsItem label="Item B Sales" number="100000">
				<StatisticsTrend direction="increase" value="100%" />
			</StatisticsItem>
		</Statistics>
	);
};
