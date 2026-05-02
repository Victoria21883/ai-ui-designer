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

export const improveUIPrompt = (existingJSON: string, improvementDescription: string): string => {
  return `
Улучши существующий UI макет на основе описания.

Существующий JSON:
${existingJSON}

Что нужно улучшить: "${improvementDescription}"

Верни улучшенную JSON структуру в том же формате.
`;
};

export const imageToUIPrompt = (): string => {
  return `
Проанализируй изображение и создай JSON структуру UI макета.
Определи все компоненты на изображении: кнопки, поля ввода, карточки, текст.
Используй те же типы компонентов и Tailwind классы.
`;
};

export const analyzeUIVisionPrompt = (): string => {
  return `
Ты — эксперт по UI/UX анализу. Твоя задача: проанализировать скриншот интерфейса и воссоздать его структуру в формате JSON.

ПРАВИЛА ГЕНЕРАЦИИ:
1. Используй только эти типы компонентов: header, button, input, card, text, container, image.
2. Для каждого элемента определи подходящие Tailwind CSS классы для стилизации (отступы, цвета, скругления).
3. Сохраняй иерархию (вложенность элементов в контейнеры и карточки).
4. Текст должен точно соответствовать тексту на изображении.
5. Для изображений используй заглушки https://via.placeholder.com/150 или описывай их.

ОТВЕТЬ ТОЛЬКО ЧИСТЫМ JSON по этой схеме:
{
  "components": [
    {
      "type": "container",
      "style": "p-6 bg-gray-50 flex flex-col gap-4",
      "children": [
        { "type": "text", "content": "Заголовок", "style": "text-xl font-bold" },
        { "type": "button", "text": "Нажми меня", "style": "bg-blue-500 text-white rounded-lg p-2" }
      ]
    }
  ]
}
`;
};
