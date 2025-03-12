import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChatSession, ChatMessage, ChatWithMessages } from "@/lib/mcp-types";

// WebSocket connection for real-time updates
let socket: WebSocket | null = null;

export function useChatSessions() {
  const { toast } = useToast();

  // Fetch all chat sessions
  const { 
    data: sessions, 
    isLoading,
    error,
    refetch 
  } = useQuery<ChatSession[]>({
    queryKey: ["/api/chats"],
    refetchOnWindowFocus: false,
  });

  // Create a new chat session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: { title?: string; providerId: number; model: string }) => {
      const res = await apiRequest("POST", "/api/chats", sessionData);
      return await res.json();
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      toast({
        title: "Chat created",
        description: "New chat session has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create chat",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete a chat session
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      await apiRequest("DELETE", `/api/chats/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      toast({
        title: "Chat deleted",
        description: "Chat session has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete chat",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    sessions,
    isLoading,
    error,
    refetchSessions: refetch,
    createSession: createSessionMutation.mutate,
    isCreating: createSessionMutation.isPending,
    deleteSession: deleteSessionMutation.mutate,
    isDeleting: deleteSessionMutation.isPending,
  };
}

export function useChatMessages(sessionId?: number) {
  const { toast } = useToast();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch chat messages if session ID is provided
  const { 
    data: chatData, 
    isLoading,
    error,
    refetch 
  } = useQuery<ChatWithMessages>({
    queryKey: sessionId ? [`/api/chats/${sessionId}`] : null,
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
  });

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!sessionId) return;
    
    // Create WebSocket if it doesn't exist
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setIsConnected(true);
        console.log("WebSocket connected");
        
        // Subscribe to the chat session
        if (sessionId) {
          socket.send(JSON.stringify({
            type: 'subscribe',
            chatId: sessionId
          }));
        }
      };
      
      socket.onclose = () => {
        setIsConnected(false);
        console.log("WebSocket disconnected");
      };
    }
    
    // Handle incoming messages
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_message' && data.sessionId === sessionId) {
          // Add the message to our local state
          setLocalMessages(prev => [...prev, data.message]);
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };
    
    socket.addEventListener('message', handleMessage);
    
    // Clean up
    return () => {
      if (socket) {
        socket.removeEventListener('message', handleMessage);
        
        // Unsubscribe from the chat session
        if (sessionId && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'unsubscribe',
            chatId: sessionId
          }));
        }
      }
    };
  }, [sessionId]);
  
  // Combine fetched messages with local ones
  const allMessages = [
    ...(chatData?.messages || []),
    ...localMessages.filter(msg => 
      !(chatData?.messages?.some(m => m.id === msg.id))
    )
  ];
  
  // Sort messages by timestamp
  const sortedMessages = [...allMessages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, sessionId }: { content: string; sessionId: number }) => {
      // For a real implementation, this would send via API
      // For now, we'll simulate it with a local state update
      
      const userMessage: ChatMessage = {
        id: Date.now(),
        sessionId,
        role: "user",
        content,
        timestamp: new Date().toISOString()
      };
      
      // Add user message to local state
      setLocalMessages(prev => [...prev, userMessage]);
      
      // In a real implementation, we'd send to the API and get a response
      // For now, we'll simulate an assistant response after a delay
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: Date.now() + 1,
          sessionId,
          role: "assistant",
          content: `This is a simulated response to: "${content}"`,
          timestamp: new Date().toISOString()
        };
        
        setLocalMessages(prev => [...prev, assistantMessage]);
      }, 1000);
      
      return userMessage;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    messages: sortedMessages,
    session: chatData?.session,
    isLoading,
    error,
    isConnected,
    refetchMessages: refetch,
    sendMessage: (content: string) => {
      if (!sessionId) {
        toast({
          title: "Error",
          description: "No active chat session",
          variant: "destructive",
        });
        return;
      }
      
      sendMessageMutation.mutate({ content, sessionId });
    },
    isSending: sendMessageMutation.isPending,
  };
}
