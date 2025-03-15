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

    // Prepare messages for Claude API
    // Claude doesn't support 'system' role directly, so we need to convert it
    let systemMessage = '';
    const anthropicMessages = [];
    
    // Extract system message if any
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemMessage = msg.content;
      } else {
        anthropicMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      }
    }
    
    // Create the completion request
    const response = await anthropic.messages.create({
      model,
      system: systemMessage,
      messages: anthropicMessages,
      temperature,
      max_tokens: maxTokens
    });
    
    // Extract the text content from the response
    if (response.content && response.content.length > 0) {
      for (const contentBlock of response.content) {
        if (contentBlock.type === 'text') {
          return contentBlock.text;
        }
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error generating Anthropic chat completion:', error);
    throw error;
  }
}