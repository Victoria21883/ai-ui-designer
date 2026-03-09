// src/core/ai/errors.ts

// Тип для ошибки
export interface AIErrorType {
  message: string;
  code: string;
  status?: number;
  name: string;
}

// Функция для создания ошибки (вместо класса)
export function createAIError(message: string, code: string, status?: number): AIErrorType & Error {
  const error = new Error(message) as AIErrorType & Error;
  error.name = 'AIError';
  error.code = code;
  error.status = status;
  return error;
}

// Проверка на тип ошибки
export function isAIError(error: unknown): error is AIErrorType {
  return (
    error instanceof Error &&
    (error as AIErrorType).name === 'AIError' &&
    typeof (error as AIErrorType).code === 'string'
  );
}
