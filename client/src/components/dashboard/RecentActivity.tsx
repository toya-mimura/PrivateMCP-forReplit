import {
  Check,
  Plus,
  ArrowLeft,
  MoreHorizontal
} from "lucide-react";

interface ActivityItem {
  id: number;
  type: "token" | "tool" | "provider" | "config";
  message: string;
  time: string;
}

// Sample activities - in a real app, these would come from an API
const activities: ActivityItem[] = [
  {
    id: 1,
    type: "token",
    message: "New access token generated",
    time: "12 minutes ago"
  },
  {
    id: 2,
    type: "tool",
    message: "New tool registered: GitHub Repository",
    time: "2 hours ago"
  },
  {
    id: 3,
    type: "provider",
    message: "API Key added for Anthropic",
    time: "3 hours ago"
  },
  {
    id: 4,
    type: "config",
    message: "Server configuration updated",
    time: "1 day ago"
  }
];

export default function RecentActivity() {
  const getIconForType = (type: string) => {
    switch (type) {
      case "token":
        return <ArrowLeft className="h-4 w-4 text-primary" />;
      case "tool":
        return <Plus className="h-4 w-4 text-accent" />;
      case "provider":
        return <Check className="h-4 w-4 text-success" />;
      default:
        return <MoreHorizontal className="h-4 w-4 text-warning" />;
    }
  };

  const getBgColorForType = (type: string) => {
    switch (type) {
      case "token":
        return "bg-blue-100 dark:bg-slate-700";
      case "tool":
        return "bg-purple-100 dark:bg-slate-700";
      case "provider":
        return "bg-green-100 dark:bg-slate-700";
      default:
        return "bg-yellow-100 dark:bg-slate-700";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full ${getBgColorForType(activity.type)} flex items-center justify-center mt-1`}>
              {getIconForType(activity.type)}
            </div>
            <div>
              <p className="text-sm font-medium">{activity.message}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <a href="#" className="block text-center text-sm text-primary font-medium mt-4">View All Activity</a>
    </div>
  );
}
