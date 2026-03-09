// src/core/ai/mockData.ts

// Тип для макета страницы
export interface MockLayout {
  type: 'page';
  children: MockComponent[];
}

// Тип для компонента в моковых данных
export interface MockComponent {
  type: string;
  text?: string;
  style?: string;
  props?: Record<string, unknown>;
  children?: MockComponent[];
}

// Моковые данные для тестирования без реального API
export const mockAIResponses: Record<string, MockLayout> = {
  'страница входа': {
    type: 'page',
    children: [
      {
        type: 'header',
        text: 'Вход в систему',
        style: 'text-3xl font-bold text-center mb-6',
      },
      {
        type: 'container',
        style: 'max-w-md mx-auto p-6 bg-white rounded-lg shadow-md',
        children: [
          {
            type: 'input',
            props: {
              label: 'Email',
              placeholder: 'Введите email',
              type: 'email',
            },
            style: 'mb-4',
          },
          {
            type: 'input',
            props: {
              label: 'Пароль',
              placeholder: 'Введите пароль',
              type: 'password',
            },
            style: 'mb-6',
          },
          {
            type: 'button',
            text: 'Войти',
            style: 'w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600',
          },
        ],
      },
    ],
  },

  'карточка товара': {
    type: 'page',
    children: [
      {
        type: 'card',
        style: 'max-w-sm mx-auto',
        children: [
          {
            type: 'image',
            props: {
              src: 'https://via.placeholder.com/300',
              alt: 'Товар',
            },
            style: 'w-full h-48 object-cover rounded-t-lg',
          },
          {
            type: 'container',
            style: 'p-4',
            children: [
              {
                type: 'text',
                props: {
                  content: 'Название товара',
                  variant: 'h3',
                },
                style: 'text-xl font-bold mb-2',
              },
              {
                type: 'text',
                props: {
                  content: 'Описание товара...',
                  variant: 'body',
                },
                style: 'text-gray-600 mb-4',
              },
              {
                type: 'container',
                style: 'flex justify-between items-center',
                children: [
                  {
                    type: 'text',
                    props: {
                      content: '$99.99',
                      variant: 'h4',
                    },
                    style: 'text-2xl font-bold text-blue-600',
                  },
                  {
                    type: 'button',
                    text: 'Купить',
                    style: 'bg-green-500 text-white px-4 py-2 rounded',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  'форма регистрации': {
    type: 'page',
    children: [
      {
        type: 'header',
        text: 'Регистрация',
        style: 'text-3xl font-bold text-center mb-6',
      },
      {
        type: 'container',
        style: 'max-w-md mx-auto p-6 bg-white rounded-lg shadow-md',
        children: [
          {
            type: 'input',
            props: {
              placeholder: 'Имя',
              type: 'text',
            },
            style: 'w-full mb-4 p-2 border rounded',
          },
          {
            type: 'input',
            props: {
              placeholder: 'Email',
              type: 'email',
            },
            style: 'w-full mb-4 p-2 border rounded',
          },
          {
            type: 'input',
            props: {
              placeholder: 'Пароль',
              type: 'password',
            },
            style: 'w-full mb-4 p-2 border rounded',
          },
          {
            type: 'button',
            text: 'Зарегистрироваться',
            style: 'w-full bg-green-500 text-white py-2 rounded hover:bg-green-600',
          },
        ],
      },
    ],
  },
};

// Тип для возвращаемого значения функции getMockResponse
export type MockResponse = MockLayout;

// Функция для получения мокового ответа
export const getMockResponse = (prompt: string): MockLayout => {
  // Ищем ключевые слова в промпте
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('вход') || lowerPrompt.includes('логин')) {
    return mockAIResponses['страница входа'];
  }

  if (lowerPrompt.includes('карточка') || lowerPrompt.includes('товар')) {
    return mockAIResponses['карточка товара'];
  }

  // ✅ ДОБАВЛЕНО: обработка для регистрации
  if (lowerPrompt.includes('регистрация') || lowerPrompt.includes('регистр')) {
    return mockAIResponses['форма регистрации'];
  }

  // Возвращаем простой ответ по умолчанию
  return {
    type: 'page',
    children: [
      {
        type: 'header',
        text: 'Сгенерированный макет',
        style: 'text-2xl font-bold mb-4',
      },
      {
        type: 'text',
        props: {
          content: prompt,
          variant: 'body',
        },
        style: 'mb-4',
      },
      {
        type: 'button',
        text: 'Действие',
        style: 'bg-primary text-white px-4 py-2 rounded',
      },
    ],
  };
};
