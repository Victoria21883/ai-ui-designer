import axios from 'axios';
import type { AxiosInstance as AxiosInstanceType, AxiosError } from 'axios';
import type { AIRequest, AIResponse } from './types';
import { createAIError } from './errors';

interface GeminiErrorResponse {
  error: {
    message: string;
    code: number;
    status: string;
  };
}

export interface VisionRequest {
  imageBase64: string;
  prompt: string;
}

class AIService {
  private client: AxiosInstanceType;
  private model: string = 'gemini-2.5-flash';

  constructor() {
    this.client = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/',
      timeout: 30000,
    });
  }

  private getApiKey(): string {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw createAIError('API ключ Gemini не найден', 'MISSING_API_KEY');
    }
    return apiKey;
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    try {
      const apiKey = this.getApiKey();
      const response = await this.client.post(
        `models/${this.model}:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [{ text: request.prompt }],
            },
          ],
        }
      );

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        content: content,
        model: this.model,
      };
    } catch (error) {
      const axiosError = error as AxiosError<GeminiErrorResponse>;
      const status = axiosError.response?.status;
      const msg = axiosError.response?.data?.error?.message || 'Ошибка Gemini';
      throw createAIError(msg, 'API_ERROR', status);
    }
  }

  async generateFromImage(request: VisionRequest): Promise<AIResponse> {
    try {
      const apiKey = this.getApiKey();
      const base64Data = request.imageBase64.split(',')[1] || request.imageBase64;

      const response = await this.client.post(
        `models/${this.model}:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                { text: request.prompt },
                {
                  inline_data: {
                    mime_type: 'image/png',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }
      );

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        content: content,
        model: this.model,
      };
    } catch (error) {
      const axiosError = error as AxiosError<GeminiErrorResponse>;
      const msg = axiosError.response?.data?.error?.message || 'Ошибка Vision';
      throw createAIError(msg, 'VISION_ERROR');
    }
  }
}

export const aiService = new AIService();
export default AIService;
