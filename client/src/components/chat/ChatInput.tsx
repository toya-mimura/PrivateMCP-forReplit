import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, CodeIcon, Wrench, Send, Loader2 } from "lucide-react";
import { Tool } from "@/lib/mcp-types";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isDisabled: boolean;
  isSending: boolean;
  tools: Tool[];
}

export default function ChatInput({ 
  onSendMessage, 
  isDisabled, 
  isSending,
  tools
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLDivElement>(null);
  
  // Handle sending message
  const handleSend = () => {
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage("");
      
      // Clear contentEditable div
      if (inputRef.current) {
        inputRef.current.innerHTML = "";
      }
    }
  };
  
  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Handle input change
  const handleInput = () => {
    if (inputRef.current) {
      setMessage(inputRef.current.innerText);
    }
  };
  
  // Insert code block
  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (selection && inputRef.current) {
      const range = selection.getRangeAt(0);
      const codeBlock = document.createTextNode("```\n\n```");
      range.insertNode(codeBlock);
      
      // Position cursor inside the code block
      range.setStart(codeBlock, 4);
      range.setEnd(codeBlock, 4);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Update message state
      handleInput();
      
      // Focus input
      inputRef.current.focus();
    }
  };
  
  // Insert tool reference
  const insertToolReference = (toolName: string) => {
    if (inputRef.current) {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        const toolText = document.createTextNode(`@${toolName} `);
        range.insertNode(toolText);
        
        // Position cursor after the tool reference
        range.setStartAfter(toolText);
        range.setEndAfter(toolText);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update message state
        handleInput();
        
        // Focus input
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
      <div className="flex space-x-3">
        <div className="flex-1">
          <div className="border border-slate-300 dark:border-slate-600 rounded-lg">
            <div
              ref={inputRef}
              className="px-3 py-2 min-h-[80px] max-h-[200px] overflow-y-auto outline-none"
              contentEditable={!isDisabled}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              aria-label="Chat message input"
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" 
                  title="Attach files"
                  disabled={isDisabled}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" 
                  title="Insert code block"
                  onClick={insertCodeBlock}
                  disabled={isDisabled}
                >
                  <CodeIcon className="h-5 w-5" />
                </Button>
                
                {tools.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" 
                        title="Use tools"
                        disabled={isDisabled}
                      >
                        <Wrench className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm mb-2">Available Tools</h4>
                        {tools.map(tool => (
                          <Button
                            key={tool.id}
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => insertToolReference(tool.name)}
                          >
                            <span className="truncate">{tool.name}</span>
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <Button 
                onClick={handleSend} 
                disabled={isDisabled || !message.trim()}
                className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-1.5 text-sm font-medium"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
