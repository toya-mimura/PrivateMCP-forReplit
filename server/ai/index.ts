import { generateOpenAIChatCompletion } from './openai';
import { generateAnthropicChatCompletion } from './anthropic';
import { storage } from '../storage';
import { InsertChatMessage } from '@shared/schema';

// Message type used for AI providers
export type AIMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string; // For tool messages in OpenAI
};

/**
 * Generate a response using the appropriate AI provider
 */
export async function generateAIResponse(
  providerId: number,
  model: string,
  messages: AIMessage[],
  temperature: number = 0.7,
  maxTokens?: number
): Promise<string> {
  try {
    // Get provider information
    const provider = await storage.getProvider(providerId);
    
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }
    
    if (!provider.active) {
      throw new Error(`Provider ${provider.name} is inactive`);
    }
    
    if (!provider.apiKey) {
      throw new Error(`Provider ${provider.name} has no API key configured`);
    }
    
    // Route to appropriate provider
    switch (provider.provider) {
      case 'openai':
        return await generateOpenAIChatCompletion(
          providerId,
          model,
          messages.map(msg => {
            if (msg.role === 'tool') {
              return {
                role: 'tool',
                content: msg.content,
                tool_call_id: msg.name // Use name as tool_call_id for OpenAI
              };
            }
            return msg;
          }),
          temperature,
          maxTokens
        );
        
      case 'anthropic':
        // Claude doesn't support tool messages, so we need to convert them
        const claudeMessages = messages.filter(msg => msg.role !== 'tool').map(msg => ({
          role: msg.role === 'system' ? 'user' : msg.role, // Claude handles system messages differently
          content: msg.role === 'system' ? `<system>${msg.content}</system>` : msg.content
        }));
        
        return await generateAnthropicChatCompletion(
          providerId,
          model,
          claudeMessages,
          temperature,
          maxTokens || 1000
        );
        
      default:
        throw new Error(`Unsupported AI provider: ${provider.provider}`);
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

/**
 * Process a user message and generate an AI response
 * Stores both messages in the database and returns the AI response
 */
export async function processUserMessage(
  sessionId: number,
  content: string
): Promise<{ userMessage: InsertChatMessage, aiMessage: InsertChatMessage }> {
  try {
    // Get the chat session
    const session = await storage.getChatSession(sessionId);
    if (!session) {
      throw new Error(`Chat session with ID ${sessionId} not found`);
    }
    
    // Create the user message
    const userMessage: InsertChatMessage = {
      sessionId,
      role: 'user',
      content
    };
    
    // Store the user message
    await storage.createChatMessage(userMessage);
    
    // Get all messages in the session
    const messages = await storage.getChatMessages(sessionId);
    
    // Convert messages to AI provider format
    const aiMessages: AIMessage[] = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system' | 'tool',
      content: msg.content,
      name: msg.toolName || undefined
    }));
    
    // Generate AI response
    const responseContent = await generateAIResponse(
      session.providerId,
      session.model,
      aiMessages
    );
    
    // Create the AI response message
    const aiMessage: InsertChatMessage = {
      sessionId,
      role: 'assistant',
      content: responseContent
    };
    
    // Store the AI response
    await storage.createChatMessage(aiMessage);
    
    return { userMessage, aiMessage };
  } catch (error) {
    console.error('Error processing user message:', error);
    throw error;
  }
}