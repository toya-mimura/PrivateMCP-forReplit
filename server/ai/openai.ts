import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { storage } from '../storage';

/**
 * Helper function to get an OpenAI client instance for a provider
 */
export async function getOpenAIClient(providerId: number): Promise<OpenAI | null> {
  try {
    const provider = await storage.getProvider(providerId);
    
    if (!provider || provider.provider !== 'openai' || !provider.apiKey) {
      console.error(`Unable to initialize OpenAI client for provider ${providerId}: Invalid provider configuration`);
      return null;
    }
    
    return new OpenAI({
      apiKey: provider.apiKey
    });
  } catch (error) {
    console.error(`Error initializing OpenAI client for provider ${providerId}:`, error);
    return null;
  }
}

/**
 * Generate a chat completion using OpenAI
 */
export async function generateOpenAIChatCompletion(
  providerId: number,
  model: string,
  messages: Array<{
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    name?: string;
  }>,
  temperature: number = 0.7,
  maxTokens?: number
) {
  try {
    const openai = await getOpenAIClient(providerId);
    
    if (!openai) {
      throw new Error('Failed to initialize OpenAI client');
    }
    
    // Convert our message format to OpenAI's expected format
    const formattedMessages: ChatCompletionMessageParam[] = messages.map(msg => {
      // Handle different role types
      if (msg.role === 'system') {
        return { role: 'system', content: msg.content };
      } else if (msg.role === 'user') {
        return { role: 'user', content: msg.content };
      } else if (msg.role === 'assistant') {
        return { role: 'assistant', content: msg.content };
      } else if (msg.role === 'tool') {
        return { 
          role: 'tool', 
          content: msg.content,
          tool_call_id: msg.name || 'unknown'
        };
      }
      
      // Default fallback
      return { role: 'user', content: msg.content };
    });
    
    console.log(`Sending request to OpenAI with model ${model}`);
    
    const completion = await openai.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
    });
    
    const response = completion.choices[0]?.message.content || '';
    console.log(`Received response from OpenAI (${response.length} chars): ${response.substring(0, 50)}...`);
    
    return response;
  } catch (error) {
    console.error('Error generating OpenAI chat completion:', error);
    throw error;
  }
}