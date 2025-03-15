import { useState, useEffect, useRef } from "react";
import { useProviders } from "@/hooks/use-providers";
import { useChatSessions, useChatMessages } from "@/hooks/use-chat";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, Bug } from "lucide-react";
import { AIProvider, AIProviderModel, ChatSession } from "@/lib/mcp-types";
import { getAvailableModels } from "@/hooks/use-providers";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatDebug from "./ChatDebug";
import { useTools } from "@/hooks/use-tools";

export default function ChatInterface() {
  const { providers, isLoading: isLoadingProviders } = useProviders();
  const { sessions, createSession, isLoading: isLoadingSessions } = useChatSessions();
  const { tools, isLoading: isLoadingTools } = useTools();
  
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [availableModels, setAvailableModels] = useState<AIProviderModel[]>([]);
  const [chatKey, setChatKey] = useState(0); // Key to force remount of chat hook
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading: isLoadingMessages, 
    sendMessage, 
    isSending,
    isConnected 
  } = useChatMessages(activeSession?.id);
  
  // Log WebSocket connection status
  useEffect(() => {
    console.log(`WebSocket connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
    if (isConnected && activeSession) {
      console.log(`Successfully connected to session ${activeSession.id}`);
    }
  }, [isConnected, activeSession]);
  
  // Set available models when provider changes
  useEffect(() => {
    if (selectedProvider) {
      const models = getAvailableModels(selectedProvider.provider);
      setAvailableModels(models);
      
      // If there's no selected model yet or the current selection isn't in the list,
      // default to the first available model
      if (!selectedModel || !models.some(m => m.id === selectedModel)) {
        setSelectedModel(models[0]?.id || "");
      }
    } else {
      setAvailableModels([]);
      setSelectedModel("");
    }
  }, [selectedProvider, selectedModel]);
  
  // Default to first active provider when providers load
  useEffect(() => {
    if (providers && providers.length > 0 && !selectedProvider) {
      const activeProviders = providers.filter(p => p.active);
      if (activeProviders.length > 0) {
        setSelectedProvider(activeProviders[0]);
      }
    }
  }, [providers, selectedProvider]);
  
  // Default to the most recent session when sessions load
  useEffect(() => {
    if (sessions && sessions.length > 0 && !activeSession) {
      // Sort by most recent
      const sortedSessions = [...sessions].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - 
                  new Date(a.updatedAt || a.createdAt).getTime()
      );
      setActiveSession(sortedSessions[0]);
      
      // Set provider and model based on the session
      if (providers) {
        const sessionProvider = providers.find(p => p.id === sortedSessions[0].providerId);
        if (sessionProvider) {
          setSelectedProvider(sessionProvider);
          setSelectedModel(sortedSessions[0].model);
        }
      }
    }
  }, [sessions, activeSession, providers]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Create a new chat session
  const handleNewChat = () => {
    if (selectedProvider && selectedModel) {
      createSession({
        title: "New Chat",
        providerId: selectedProvider.id,
        model: selectedModel
      }, {
        onSuccess: (newSession) => {
          console.log(`Created new session with ID ${newSession.id}`);
          setActiveSession(newSession);
          
          // Force WebSocket to reconnect with the new session ID
          setChatKey(prev => prev + 1);
        }
      });
    }
  };
  
  // Handle sending a message
  const handleSendMessage = (content: string) => {
    if (activeSession) {
      sendMessage(content);
    } else if (selectedProvider && selectedModel) {
      // Create a new session first
      createSession({
        title: "New Chat",
        providerId: selectedProvider.id,
        model: selectedModel
      }, {
        onSuccess: (newSession) => {
          setActiveSession(newSession);
          // Send message after session is created
          setTimeout(() => sendMessage(content), 100);
        }
      });
    }
  };
  
  // Get active tools
  const activeTools = tools?.filter(tool => tool.active) || [];
  const [showDebug, setShowDebug] = useState(false);
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0">
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">MCP Chat Interface</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDebug(!showDebug)}
                title="Toggle debug panel"
              >
                <Bug className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div>
                <Select 
                  value={selectedProvider?.id.toString() || ""} 
                  onValueChange={(value) => {
                    const provider = providers?.find(p => p.id === parseInt(value));
                    if (provider) {
                      setSelectedProvider(provider);
                    }
                  }}
                  disabled={isLoadingProviders}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers?.filter(p => p.active).map(provider => (
                      <SelectItem key={provider.id} value={provider.id.toString()}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
                  disabled={!selectedProvider || availableModels.length === 0}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={handleNewChat}
                disabled={!selectedProvider || !selectedModel}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
          {/* System Message */}
          <div className="bg-blue-50 dark:bg-slate-700/50 rounded-lg p-4 mx-12 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {activeSession 
                ? `Chat session with ${selectedModel}. Available tools: ${activeTools.map(t => t.name).join(', ')}.`
                : 'Start a new chat by selecting a provider and model, then sending a message.'}
            </p>
          </div>
          
          {/* Messages */}
          {messages?.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {/* Loading indicator */}
          {isLoadingMessages && (
            <div className="flex justify-center p-4">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1 max-w-sm">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Debug Panel */}
        {showDebug && (
          <div className="border-t border-slate-200 dark:border-slate-700">
            <ChatDebug />
          </div>
        )}
        
        {/* Chat Input */}
        <ChatInput 
          onSendMessage={handleSendMessage}
          isDisabled={!selectedProvider || !selectedModel || isSending}
          isSending={isSending}
          tools={activeTools}
        />
      </div>
    </div>
  );
}
