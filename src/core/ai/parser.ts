export interface UIMockupNode {
  type: string;
  text?: string;
  content?: string;
  style?: string;
  props?: Record<string, unknown>;
  components?: UIMockupNode[]; 
  children?: UIMockupNode[]; 
  [key: string]: unknown;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AIParser {
  extractJSON(text: string): string {
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonBlockRegex);
    if (match && match[1]) {
      return match[1].trim();
    }

    const jsonRegex = /[[{]([\s\S]*)[\]}]/;
    const jsonMatch = text.match(jsonRegex);
    if (jsonMatch) {
      return jsonMatch[0].trim();
    }

    return text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }

  parseJSON<T = UIMockupNode>(text: string): ParseResult<T> {
    try {
      const jsonString = this.extractJSON(text);
      const data = JSON.parse(jsonString) as T;

      if (data && typeof data === 'object') {
        return {
          success: true,
          data,
        };
      }

      return {
        success: false,
        error: 'AI вернул пустой объект или неверный формат',
      };
    } catch (error) {
      console.error('Ошибка парсинга JSON от AI:', error);
      return {
        success: false,
        error: 'Не удалось прочитать ответ от AI. Попробуйте еще раз.',
      };
    }
  }

  validateUIMockup(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;

    const node = data as Record<string, unknown>;

    if (Array.isArray(node.components)) {
      return node.components.every((c) => typeof (c as Record<string, unknown>).type === 'string');
    }

    return typeof node.type === 'string';
  }
}

export const aiParser = new AIParser();
