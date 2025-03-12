import { ChatMessage as ChatMessageType } from "@/lib/mcp-types";
import { Lightbulb } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // Format code blocks in message content
  const formatContent = (content: string) => {
    // Replace code blocks
    let formattedContent = content.replace(
      /```([\w]*)\n([\s\S]*?)```/g,
      (match, language, code) => {
        return `<pre class="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs overflow-x-auto my-2"><code class="language-${language || 'text'}">${code.trim()}</code></pre>`;
      }
    );
    
    // Replace inline code
    formattedContent = formattedContent.replace(
      /`([^`]+)`/g,
      '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">$1</code>'
    );
    
    // Replace newlines with <br>
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return formattedContent;
  };

  // Render message based on role
  const renderMessage = () => {
    switch (message.role) {
      case "user":
        return (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center font-medium">
              U
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 max-w-3xl">
              <div dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
            </div>
          </div>
        );
      case "assistant":
        return (
          <div className="flex items-start space-x-3 ml-12">
            <div className="flex-1 bg-primary/5 dark:bg-slate-700 rounded-lg shadow-sm p-4 max-w-3xl">
              <div dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
              A
            </div>
          </div>
        );
      case "system":
        return (
          <div className="bg-blue-50 dark:bg-slate-700/50 rounded-lg p-4 mx-12 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">{message.content}</p>
          </div>
        );
      case "tool":
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mx-12 text-center">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {message.toolName 
                ? `Tool "${message.toolName}" ${message.content}`
                : `Tool execution: ${message.content}`}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return renderMessage();
}
