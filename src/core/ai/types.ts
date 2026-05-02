export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface AIRequestOptions {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
}

export interface AIRequest {
  prompt: string;
  options?: AIRequestOptions;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface AIConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: AIModel;
  defaultTemperature?: number;
}

export type AIErrorType = {
  message: string;
  code: string;
  status?: number;
  name: string;
};
