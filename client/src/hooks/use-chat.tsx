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
    queryKey: sessionId ? [`/api/chats/${sessionId}`] : [],
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
  });

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!sessionId) return;
    
    // Function to create and set up a WebSocket connection
    const setupWebSocket = () => {
      // Close any existing connection
      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("Closing existing WebSocket connection");
        socket.close();
      }
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`Creating new WebSocket connection to ${wsUrl}`);
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setIsConnected(true);
        console.log("WebSocket connected");
        
        // Subscribe to the chat session
        if (sessionId && socket) {
          console.log(`Subscribing to chat session ${sessionId}`);
          socket.send(JSON.stringify({
            type: 'subscribe',
            chatId: sessionId
          }));
          
          // Send a ping to verify the connection is working
          socket.send(JSON.stringify({
            type: 'ping',
            timestamp: Date.now()
          }));
        }
      };
      
      socket.onclose = (event) => {
        setIsConnected(false);
        console.log(`WebSocket disconnected with code ${event.code}, reason: ${event.reason}`);
        
        // Attempt to reconnect after a delay unless it was intentionally closed
        if (event.code !== 1000) {
          console.log("Attempting to reconnect in 3 seconds...");
          setTimeout(setupWebSocket, 3000);
        }
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };
    
    // Create WebSocket if it doesn't exist or if it's closed
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setupWebSocket();
    } else if (socket.readyState === WebSocket.OPEN && sessionId) {
      // If socket is already open, ensure we're subscribed to the correct session
      console.log(`WebSocket already open, subscribing to session ${sessionId}`);
      socket.send(JSON.stringify({
        type: 'subscribe',
        chatId: sessionId
      }));
    }
    
    // Handle incoming messages
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);
        
        if (data.type === 'chat_message' && data.sessionId === sessionId) {
          console.log(`Adding new message to session ${sessionId}:`, data.message);
          // Add the message to our local state
          setLocalMessages(prev => [...prev, data.message]);
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };
    
    if (socket) {
      socket.addEventListener('message', handleMessage);
    }
    
    // Clean up
    return () => {
      if (socket) {
        socket.removeEventListener('message', handleMessage);
        
        // Unsubscribe from the chat session
        if (sessionId && socket.readyState === WebSocket.OPEN) {
          console.log(`Unsubscribing from chat session ${sessionId}`);
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
  
  // Error handling for WebSocket messages
  useEffect(() => {
    if (!socket) return;
    
    const handleError = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'error') {
          toast({
            title: "Chat Error",
            description: data.message || "Unknown error occurred",
            variant: "destructive",
          });
        }
      } catch (e) {
        console.error("Error parsing WebSocket error message:", e);
      }
    };
    
    if (socket) {
      socket.addEventListener('message', handleError);
      
      return () => {
        socket?.removeEventListener('message', handleError);
      };
    }
    
    return undefined;
  }, [toast]);

  // Send message via WebSocket
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, sessionId }: { content: string; sessionId: number }) => {
      return new Promise<void>((resolve, reject) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          console.log("WebSocket not open, creating new connection...");
          
          // Create a new WebSocket connection
          const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
          const wsUrl = `${protocol}//${window.location.host}/ws`;
          socket = new WebSocket(wsUrl);
          
          socket.onopen = () => {
            console.log("WebSocket opened, subscribing to session");
            setIsConnected(true);
            
            if (socket) {
              // Subscribe to the session
              socket.send(JSON.stringify({
                type: 'subscribe',
                chatId: sessionId
              }));
              
              // Now send the message
              setTimeout(() => {
                try {
                  if (socket) {
                    socket.send(JSON.stringify({
                      type: 'chat_message',
                      sessionId,
                      content
                    }));
                    resolve();
                  } else {
                    reject(new Error("WebSocket connection lost"));
                  }
                } catch (error) {
                  reject(error);
                }
              }, 500);
            } else {
              reject(new Error("WebSocket connection lost"));
            }
          };
          
          socket.onerror = (event) => {
            console.error("WebSocket error during send:", event);
            reject(new Error("Failed to connect to WebSocket server"));
          };
          
          return;
        }
        
        try {
          console.log(`Sending message to session ${sessionId} via WebSocket`);
          
          // Send the message via WebSocket
          socket.send(JSON.stringify({
            type: 'chat_message',
            sessionId,
            content
          }));
          
          // The actual message will be added to the state when we receive it back via WebSocket
          resolve();
        } catch (error) {
          console.error("Error sending message:", error);
          reject(error);
        }
      });
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
