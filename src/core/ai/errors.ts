export interface AIErrorType {
  message: string;
  code: string;
  status?: number;
  name: string;
}

export function createAIError(message: string, code: string, status?: number): AIErrorType & Error {
  const error = new Error(message) as AIErrorType & Error;
  error.name = 'AIError';
  error.code = code;
  error.status = status;
  return error;
}

export function isAIError(error: unknown): error is AIErrorType {
  return (
    error instanceof Error &&
    (error as AIErrorType).name === 'AIError' &&
    typeof (error as AIErrorType).code === 'string'
  );
}
