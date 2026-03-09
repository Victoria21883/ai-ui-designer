// src/core/ai/parser.ts

// Тип для структуры UI макета
export interface UIMockupNode {
  type: string;
  text?: string;
  style?: string;
  props?: Record<string, unknown>;
  children?: UIMockupNode[];
  [key: string]: unknown; // для других возможных полей
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  originalContent?: string;
}

export class AIParser {
  // Извлечение JSON из текста (AI может вернуть текст с пояснениями)
  extractJSON(text: string): string {
    // Ищем JSON между тройными обратными кавычками
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonBlockRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    // Ищем JSON в фигурных скобках
    const jsonRegex = /\{[\s\S]*\}/;
    const jsonMatch = text.match(jsonRegex);

    if (jsonMatch) {
      return jsonMatch[0];
    }

    // Если ничего не нашли, возвращаем весь текст
    return text.trim();
  }

  // Парсинг JSON с обработкой ошибок
  parseJSON<T = UIMockupNode>(text: string): ParseResult<T> {
    try {
      // Сначала извлекаем JSON из текста
      const jsonString = this.extractJSON(text);

      // Пробуем распарсить
      const data = JSON.parse(jsonString) as T;

      // Валидация базовой структуры
      if (this.validateUIMockup(data as unknown as UIMockupNode)) {
        return {
          success: true,
          data,
          originalContent: text,
        };
      } else {
        return {
          success: false,
          error: 'Неверная структура макета',
          originalContent: text,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка парсинга JSON',
        originalContent: text,
      };
    }
  }

  // Валидация структуры макета
  private validateUIMockup(data: UIMockupNode | unknown): boolean {
    // Проверяем наличие type
    if (!data || typeof data !== 'object') return false;

    const node = data as UIMockupNode;
    if (!node.type || typeof node.type !== 'string') return false;

    // Если есть children, проверяем их
    if (node.children && Array.isArray(node.children)) {
      return node.children.every((child) => this.validateUIMockup(child));
    }

    return true;
  }

  // Форматирование JSON для отображения
  formatJSON(data: unknown): string {
    return JSON.stringify(data, null, 2);
  }

  // Очистка JSON от лишних полей
  sanitizeJSON(data: unknown): UIMockupNode | UIMockupNode[] | unknown {
    // Удаляем поля, которые не нужны
    const allowedTypes = [
      'page',
      'header',
      'button',
      'input',
      'card',
      'text',
      'container',
      'image',
    ];

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeJSON(item)) as UIMockupNode[];
    }

    if (data && typeof data === 'object') {
      const node = data as Record<string, unknown>;
      const sanitized: Partial<UIMockupNode> = {};

      // Копируем только разрешенные поля
      if (typeof node.type === 'string' && allowedTypes.includes(node.type)) {
        sanitized.type = node.type;
      }

      if (typeof node.text === 'string') {
        sanitized.text = node.text;
      }

      if (typeof node.style === 'string') {
        sanitized.style = node.style;
      }

      if (node.props && typeof node.props === 'object') {
        sanitized.props = node.props as Record<string, unknown>;
      }

      if (node.children) {
        sanitized.children = this.sanitizeJSON(node.children) as UIMockupNode[];
      }

      return sanitized;
    }

    return data;
  }
}

// Экспортируем экземпляр парсера
export const aiParser = new AIParser();
