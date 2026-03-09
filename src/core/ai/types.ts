// src/core/ai/types.ts

// Типы для запросов к AI
export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3';

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

// Типы для конфигурации
export interface AIConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: AIModel;
  defaultTemperature?: number;
}

// Тип для ошибки (не класс!)
export type AIErrorType = {
  message: string;
  code: string;
  status?: number;
  name: string;
};
