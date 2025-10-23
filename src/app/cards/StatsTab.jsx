import {
	Statistics,
	StatisticsItem,
	StatisticsTrend,
	Text,
	ErrorState,
	EmptyState,
	LoadingSpinner,
} from "@hubspot/ui-extensions";

const StatsTab = ({ data, error }) => {
	if (!data) return <LoadingSpinner layout="centered" size="md" label="Loading..." />;
	if (error) return <ErrorState title="Something went wrong." message={error} />;
	if (data.empty)
		return (
			<EmptyState title="Nothing here yet" layout="vertical" reverseOrder={true}>
				<Text>{data.message}</Text>
			</EmptyState>
		);

	return (
		<Statistics>
			{["sent", "failed", "received"].map((type) => (
				<StatisticsItem
					key={type}
					label={type.charAt(0).toUpperCase() + type.slice(1)}
					number={data?.[type]?.this_month ?? 0}
				>
					{data?.[type]?.change?.type !== "none" && (
						<StatisticsTrend direction={data[type].change.type} value={`${data[type].change.change ?? 0}%`} />
					)}
					<Text variant="caption">Last month: {data?.[type]?.last_month ?? 0}</Text>
				</StatisticsItem>
			))}
		</Statistics>
	);
};

export default StatsTab;
