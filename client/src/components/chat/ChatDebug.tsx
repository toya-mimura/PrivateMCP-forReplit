import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * A debug component to test WebSocket connectivity and AI provider status
 */
export default function ChatDebug() {
  const [status, setStatus] = useState<string>('Disconnected');
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const { toast } = useToast();
  
  // Test WebSocket connection
  const testWebsocket = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      
      setStatus('Connecting...');
      
      socket.onopen = () => {
        setStatus('Connected');
        toast({
          title: "WebSocket Connected",
          description: "Connection established successfully",
        });
        
        // Send a ping message
        console.log("Sending ping message to WebSocket");
        socket.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }));
        
        // Set up message handler
        socket.onmessage = (event) => {
          try {
            console.log("Received WebSocket message:", event.data);
            
            const data = JSON.parse(event.data);
            
            if (data.type === 'pong') {
              setResponse(`Received pong response. Round-trip time: ${Date.now() - data.timestamp}ms`);
              toast({
                title: "WebSocket Test Success",
                description: "Received pong response from server",
              });
            }
          } catch (e) {
            console.error("Error parsing WebSocket test message:", e);
            setResponse(`Error parsing server response: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        };
        
        // Close after 5 seconds
        setTimeout(() => {
          socket.close();
        }, 5000);
      };
      
      socket.onclose = () => {
        setStatus('Disconnected');
      };
      
      socket.onerror = (event) => {
        setStatus(`Error: Connection failed`);
        toast({
          title: "WebSocket Error",
          description: "Failed to connect to the server",
          variant: "destructive",
        });
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setStatus(`Error: ${errorMessage}`);
      toast({
        title: "WebSocket Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      });
    }
  };
  
  // Send a test message to the API directly (not WebSocket)
  const testProviderApi = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to test",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setResponse('Sending request...');
      
      // Get the first active provider
      const providersResponse = await fetch('/api/providers');
      if (!providersResponse.ok) {
        throw new Error('Failed to fetch providers');
      }
      
      const providers = await providersResponse.json();
      const activeProviders = providers.filter((p: any) => p.active);
      
      if (activeProviders.length === 0) {
        throw new Error('No active providers available. Please add and configure a provider first.');
      }
      
      const providerId = activeProviders[0].id;
      
      const result = await fetch(`/api/providers/${providerId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message
        }),
      });
      
      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || 'Failed to test provider');
      }
      
      const data = await result.json();
      setResponse(data.response || 'No response received');
      
      toast({
        title: "Test Successful",
        description: "Provider responded successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setResponse(`Error: ${errorMessage}`);
      toast({
        title: "Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Chat Connectivity Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">WebSocket Status: </div>
              <div className={`text-sm ${status === 'Connected' ? 'text-green-500' : status === 'Connecting...' ? 'text-amber-500' : 'text-red-500'}`}>
                {status}
              </div>
              <Button size="sm" onClick={testWebsocket}>Test Connection</Button>
            </div>
            
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">AI Provider Test</div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter a test message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button size="sm" onClick={testProviderApi}>Test</Button>
                </div>
                {response && (
                  <div className="mt-2 rounded border border-slate-200 dark:border-slate-700 p-2 text-sm">
                    <strong>Response:</strong>
                    <div className="whitespace-pre-wrap">{response}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}