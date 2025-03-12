interface StatItem {
  id: number;
  label: string;
  value: string;
  percentage: number;
  color: string;
}

// Sample stats - in a real app, these would come from an API
const stats: StatItem[] = [
  {
    id: 1,
    label: "API Requests",
    value: "1,245",
    percentage: 78,
    color: "bg-primary"
  },
  {
    id: 2,
    label: "Tool Invocations",
    value: "836",
    percentage: 52,
    color: "bg-accent"
  },
  {
    id: 3,
    label: "Average Response Time",
    value: "325ms",
    percentage: 32,
    color: "bg-success"
  },
  {
    id: 4,
    label: "Memory Usage",
    value: "481MB",
    percentage: 45,
    color: "bg-warning"
  }
];

export default function ServerStats() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-medium mb-4">Server Statistics</h2>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.id}>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm">{stat.label}</p>
              <p className="text-sm font-medium">{stat.value}</p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className={`${stat.color} h-2 rounded-full`} 
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <a href="#" className="block text-center text-sm text-primary font-medium mt-4">Detailed Analytics</a>
    </div>
  );
}
