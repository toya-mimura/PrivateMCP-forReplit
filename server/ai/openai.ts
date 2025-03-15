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
  messages: ChatCompletionMessageParam[],
  temperature: number = 0.7,
  maxTokens?: number
) {
  try {
    const openai = await getOpenAIClient(providerId);
    
    if (!openai) {
      throw new Error('Failed to initialize OpenAI client');
    }
    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    
    return completion.choices[0]?.message.content || '';
  } catch (error) {
    console.error('Error generating OpenAI chat completion:', error);
    throw error;
  }
}