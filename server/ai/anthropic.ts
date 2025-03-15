import Anthropic from '@anthropic-ai/sdk';
import { storage } from '../storage';

/**
 * Helper function to get an Anthropic client instance for a provider
 */
export async function getAnthropicClient(providerId: number): Promise<Anthropic | null> {
  try {
    const provider = await storage.getProvider(providerId);
    
    if (!provider || provider.provider !== 'anthropic' || !provider.apiKey) {
      console.error(`Unable to initialize Anthropic client for provider ${providerId}: Invalid provider configuration`);
      return null;
    }
    
    return new Anthropic({
      apiKey: provider.apiKey
    });
  } catch (error) {
    console.error(`Error initializing Anthropic client for provider ${providerId}:`, error);
    return null;
  }
}

/**
 * Generate a chat completion using Anthropic Claude
 */
export async function generateAnthropicChatCompletion(
  providerId: number,
  model: string,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  temperature: number = 0.7,
  maxTokens: number = 1000
) {
  try {
    const anthropic = await getAnthropicClient(providerId);
    
    if (!anthropic) {
      throw new Error('Failed to initialize Anthropic client');
    }

    // Convert messages to Anthropic format
    const formattedMessages = messages.map(msg => {
      return {
        role: msg.role,
        content: msg.content
      };
    });
    
    const response = await anthropic.messages.create({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens
    });
    
    return response.content[0]?.text || '';
  } catch (error) {
    console.error('Error generating Anthropic chat completion:', error);
    throw error;
  }
}