// src/core/ai/index.ts
import axios from 'axios';
import type { AxiosInstance as AxiosInstanceType, AxiosError as AxiosErrorType } from 'axios';
import type { AIRequest, AIResponse, AIConfig, AIModel } from './types';
import { createAIError, isAIError } from './errors';

// Тип для данных ответа (чтобы избежать any)
interface ErrorResponseData {
  error?: {
    message?: string;
  };
}

class AIService {
  private client: AxiosInstanceType;
  private defaultModel: AIModel = 'gpt-3.5-turbo';
  private defaultTemperature = 0.7;

  constructor(config?: Partial<AIConfig>) {
    this.client = axios.create({
      baseURL: config?.baseUrl || 'https://api.openai.com/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config?.apiKey || this.getApiKey()}`,
      },
    });

    this.client.interceptors.response.use((response) => response, this.handleError.bind(this));
  }

  private getApiKey(): string {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw createAIError(
        'API ключ не найден. Добавьте VITE_OPENAI_API_KEY в .env файл',
        'MISSING_API_KEY'
      );
    }
    return apiKey;
  }

  private handleError(error: AxiosErrorType): never {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as ErrorResponseData;

      if (status === 401) {
        throw createAIError('Неверный API ключ', 'INVALID_API_KEY', status);
      } else if (status === 429) {
        throw createAIError('Превышен лимит запросов', 'RATE_LIMIT', status);
      } else {
        throw createAIError(data.error?.message || 'Ошибка AI сервиса', 'API_ERROR', status);
      }
    } else if (error.request) {
      throw createAIError('Нет соединения с AI сервисом', 'NETWORK_ERROR');
    } else {
      throw createAIError(error.message || 'Неизвестная ошибка', 'UNKNOWN_ERROR');
    }
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    try {
      const model = request.options?.model || this.defaultModel;
      const temperature = request.options?.temperature || this.defaultTemperature;

      const response = await this.client.post('/chat/completions', {
        model,
        messages: [
          {
            role: 'system',
            content: 'Ты - помощник для генерации UI макетов. Отвечай только JSON.',
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        temperature,
        max_tokens: request.options?.maxTokens || 1000,
      });

      const completion = response.data.choices[0]?.message?.content || '';

      return {
        content: completion,
        usage: response.data.usage,
        model: response.data.model,
      };
    } catch (error) {
      if (isAIError(error)) {
        throw error;
      }
      throw createAIError('Неожиданная ошибка при генерации', 'UNEXPECTED_ERROR');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/models');
      return true;
    } catch {
      return false;
    }
  }
}

export const aiService = new AIService();
export default AIService;
