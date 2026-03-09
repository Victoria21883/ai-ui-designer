// src/core/ai/prompts.ts

// Базовый промпт для генерации UI
export const generateUIPrompt = (userDescription: string): string => {
  return `
Ты - AI дизайнер интерфейсов. Сгенерируй JSON структуру UI макета на основе описания пользователя.

Описание пользователя: "${userDescription}"

Требования к JSON:
1. Должен быть валидным JSON
2. Должен содержать структуру с типами компонентов
3. Используй только эти типы компонентов: header, button, input, card, text, container, image
4. Для стилей используй Tailwind CSS классы

Формат ответа (строго следуй этой структуре):
{
  "type": "page",
  "children": [
    {
      "type": "header",
      "text": "Заголовок страницы",
      "style": "text-2xl font-bold mb-4"
    },
    {
      "type": "button",
      "text": "Кнопка",
      "style": "bg-blue-500 text-white px-4 py-2 rounded"
    }
  ]
}

Важно: Ответ должен содержать ТОЛЬКО JSON, без пояснений и дополнительного текста.
`;
};

// Промпт для улучшения существующего макета
export const improveUIPrompt = (existingJSON: string, improvementDescription: string): string => {
  return `
Улучши существующий UI макет на основе описания.

Существующий JSON:
${existingJSON}

Что нужно улучшить: "${improvementDescription}"

Верни улучшенную JSON структуру в том же формате.
`;
};

// Промпт для генерации на основе изображения (для будущего использования)
export const imageToUIPrompt = (): string => {
  return `
Проанализируй изображение и создай JSON структуру UI макета.
Определи все компоненты на изображении: кнопки, поля ввода, карточки, текст.
Используй те же типы компонентов и Tailwind классы.
`;
};
