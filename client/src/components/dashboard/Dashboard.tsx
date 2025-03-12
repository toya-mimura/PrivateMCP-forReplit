import { useAuth } from "@/hooks/use-auth";
import StatusCard from "./StatusCard";
import QuickAction from "./QuickAction";
import RecentActivity from "./RecentActivity";
import ServerStats from "./ServerStats";
import { useTokens } from "@/hooks/use-tokens";
import { useTools } from "@/hooks/use-tools";
import { Home, MessageSquare, Key, Box, Database } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { tokens } = useTokens();
  const { tools } = useTools();

  return (
    <div id="dashboard-content" className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">MCP Server Overview</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatusCard
            title="Server Status"
            value="Online"
            status="success"
            icon={<Home className="h-6 w-6 text-success" />}
          />
          <StatusCard
            title="Active Tokens"
            value={`${tokens?.filter(t => !t.revoked).length || 0} Tokens`}
            icon={<Key className="h-6 w-6 text-primary" />}
          />
          <StatusCard
            title="Active Tools"
            value={`${tools?.filter(t => t.active).length || 0} Tools`}
            icon={<Box className="h-6 w-6 text-accent" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <QuickAction
              href="/chat"
              icon={<MessageSquare className="h-8 w-8 text-primary mb-2" />}
              label="Open Chat"
            />
            <QuickAction
              href="/tokens"
              icon={<Key className="h-8 w-8 text-primary mb-2" />}
              label="Generate Token"
            />
            <QuickAction
              href="/tools"
              icon={<Box className="h-8 w-8 text-primary mb-2" />}
              label="Add New Tool"
            />
            <QuickAction
              href="/providers"
              icon={<Database className="h-8 w-8 text-primary mb-2" />}
              label="Configure Providers"
            />
          </div>
        </div>

        {/* Recent Activity & Server Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <ServerStats />
        </div>
      </div>
    </div>
  );
}
