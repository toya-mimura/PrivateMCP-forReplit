import { useState } from "react";
import { useLocation } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/components/dashboard/Dashboard";
import TokenManagement from "@/components/tokens/TokenManagement";
import AIProviders from "@/components/providers/AIProviders";
import ToolRegistry from "@/components/tools/ToolRegistry";
import ChatInterface from "@/components/chat/ChatInterface";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Determine which component to show based on the current path
  const renderContent = () => {
    const path = location.split('/')[1];
    
    switch (path) {
      case 'chat':
        return <ChatInterface />;
      case 'tokens':
        return <TokenManagement />;
      case 'providers':
        return <AIProviders />;
      case 'tools':
        return <ToolRegistry />;
      case 'settings':
        return <div className="p-6">Settings page (not implemented)</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout>
      {renderContent()}
    </MainLayout>
  );
}
