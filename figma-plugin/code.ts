/// <reference types="@figma/plugin-typings" />

interface UIComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: UIComponent[];
}

interface ExportData {
  components: UIComponent[];
  projectName: string;
}

// Попытка извлечь цвет из Tailwind-класса (упрощенно)
function getColorFromClass(
  className: string
): { r: number; g: number; b: number; a: number } | null {
  if (!className) return null;
  if (className.includes('bg-white')) return { r: 1, g: 1, b: 1, a: 1 };
  if (className.includes('bg-blue-500')) return { r: 59 / 255, g: 130 / 255, b: 246 / 255, a: 1 };
  if (className.includes('bg-gray-100')) return { r: 243 / 255, g: 244 / 255, b: 246 / 255, a: 1 };
  return null;
}

async function loadFont() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
}

// ГЛАВНАЯ ФУНКЦИЯ: Теперь она рекурсивная
async function renderComponent(component: UIComponent): Promise<SceneNode> {
  const { type, props = {}, children = [] } = component;
  const className = (props.className as string) || '';

  let node: FrameNode | TextNode | RectangleNode;

  // 1. Создаем узел в зависимости от типа
  switch (type) {
    case 'container':
    case 'card': {
      const frame = figma.createFrame();
      frame.name = type.toUpperCase();

      // Базовые настройки Layout (аналог Flexbox)
      frame.layoutMode = 'VERTICAL';
      frame.itemSpacing = 10;
      frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = 16;

      // Обработка фонового цвета
      const bgColor = getColorFromClass(className);
      if (bgColor) {
        frame.fills = [{ type: 'SOLID', color: { r: bgColor.r, g: bgColor.g, b: bgColor.b } }];
      } else if (type === 'card') {
        frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        frame.cornerRadius = 8;
      } else {
        frame.fills = []; // Прозрачный контейнер по умолчанию
      }

      // РЕКУРСИЯ: Отрисовываем всех детей и вставляем их внутрь
      if (children && children.length > 0) {
        for (const child of children) {
          const childNode = await renderComponent(child);
          frame.appendChild(childNode);
        }
      } else {
        // Если детей нет, даем минимальный размер, чтобы фрейм не схлопнулся
        frame.resize(100, 100);
      }

      node = frame;
      break;
    }

    case 'button': {
      const btn = figma.createFrame();
      btn.name = 'Button';
      btn.layoutMode = 'HORIZONTAL';
      btn.primaryAxisSizingMode = 'AUTO';
      btn.counterAxisSizingMode = 'AUTO';
      btn.paddingLeft = btn.paddingRight = 16;
      btn.paddingTop = btn.paddingBottom = 8;
      btn.cornerRadius = 6;
      btn.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.51, b: 0.96 } }]; // Blue 500

      const text = figma.createText();
      await loadFont();
      text.characters = String(props.text || 'Кнопка');
      text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      btn.appendChild(text);
      node = btn;
      break;
    }

    case 'text': {
      const text = figma.createText();
      await loadFont();
      text.characters = String(props.content || 'Текст');
      text.fontSize = 16;
      text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
      node = text;
      break;
    }

    default: {
      // Если тип неизвестен, создаем текстовую заглушку
      const errorText = figma.createText();
      await loadFont();
      errorText.characters = `Unknown: ${type}`;
      node = errorText;
    }
  }

  return node;
}

async function exportToFigma(data: ExportData) {
  const { components, projectName } = data;

  // Создаем основной артборд
  const mainFrame = figma.createFrame();
  mainFrame.name = projectName || 'AI Export';
  mainFrame.layoutMode = 'VERTICAL';
  mainFrame.itemSpacing = 20;
  mainFrame.paddingLeft =
    mainFrame.paddingRight =
    mainFrame.paddingTop =
    mainFrame.paddingBottom =
      40;
  mainFrame.counterAxisSizingMode = 'AUTO';
  mainFrame.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.98 } }];

  // Проходим по списку компонентов верхнего уровня
  for (const component of components) {
    try {
      const node = await renderComponent(component);
      mainFrame.appendChild(node);
    } catch (err) {
      console.error('Ошибка при создании компонента:', err);
    }
  }

  figma.currentPage.appendChild(mainFrame);
  figma.viewport.scrollAndZoomIntoView([mainFrame]);
  figma.notify('✅ Дизайн успешно импортирован!');
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export') {
    const data = JSON.parse(msg.data) as ExportData;
    await exportToFigma(data);
  }
};

figma.showUI(__html__, { width: 400, height: 550 });
