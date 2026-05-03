'use strict';
/// <reference types="@figma/plugin-typings" />
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#cccccc');
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    };
  }
  return { r: 0.8, g: 0.8, b: 0.8 };
}
async function loadFont(fontName = { family: 'Inter', style: 'Regular' }) {
  try {
    await figma.loadFontAsync(fontName);
  } catch (_a) {
    await figma.loadFontAsync({ family: 'Arial', style: 'Regular' });
  }
}
async function renderComponent(component) {
  const { type, props = {}, children = [] } = component;
  let node;
  switch (type) {
    case 'container':
    case 'card': {
      const frame = figma.createFrame();
      frame.name = type === 'card' ? 'Card' : 'Container';
      frame.layoutMode = 'VERTICAL';
      frame.itemSpacing = 16;
      frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = 16;
      if (type === 'card') {
        frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        frame.cornerRadius = 12;
        frame.effects = [
          {
            type: 'DROP_SHADOW',
            color: { r: 0, g: 0, b: 0, a: 0.1 },
            offset: { x: 0, y: 2 },
            radius: 8,
            visible: true,
            blendMode: 'NORMAL',
          },
        ];
      } else {
        frame.fills = [];
      }
      for (const child of children) {
        const childNode = await renderComponent(child);
        frame.appendChild(childNode);
      }
      node = frame;
      break;
    }
    case 'button': {
      const btn = figma.createFrame();
      btn.name = `Button: ${props.text || 'Кнопка'}`;
      btn.layoutMode = 'HORIZONTAL';
      btn.primaryAxisSizingMode = 'AUTO';
      btn.counterAxisSizingMode = 'AUTO';
      btn.paddingLeft = btn.paddingRight = 20;
      btn.paddingTop = btn.paddingBottom = 10;
      btn.cornerRadius = 8;
      btn.fills = [{ type: 'SOLID', color: hexToRgb('#3b82f6') }];
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
    case 'input': {
      const input = figma.createFrame();
      input.name = 'Input Field';
      input.layoutMode = 'HORIZONTAL';
      input.primaryAxisSizingMode = 'FIXED';
      input.resize(280, 40);
      input.paddingLeft = 12;
      input.cornerRadius = 6;
      input.strokes = [{ type: 'SOLID', color: hexToRgb('#cccccc') }];
      input.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      const placeholder = figma.createText();
      await loadFont();
      placeholder.characters = String(props.placeholder || 'Введите текст...');
      placeholder.fills = [{ type: 'SOLID', color: hexToRgb('#999999') }];
      input.appendChild(placeholder);
      node = input;
      break;
    }
    case 'image': {
      const rect = figma.createRectangle();
      rect.name = 'Image Placeholder';
      rect.resize(200, 150);
      rect.cornerRadius = 8;
      rect.fills = [{ type: 'SOLID', color: hexToRgb('#e0e0e0') }];
      node = rect;
      break;
    }
    default: {
      const fallback = figma.createText();
      await loadFont();
      fallback.characters = `Unsupported: ${type}`;
      node = fallback;
    }
  }
  return node;
}
async function exportToFigma(data) {
  const { components, projectName } = data;
  const mainFrame = figma.createFrame();
  mainFrame.name = projectName || 'Exported Design';
  mainFrame.layoutMode = 'VERTICAL';
  mainFrame.itemSpacing = 40;
  mainFrame.paddingLeft =
    mainFrame.paddingRight =
    mainFrame.paddingTop =
    mainFrame.paddingBottom =
      60;
  mainFrame.counterAxisSizingMode = 'AUTO';
  mainFrame.fills = [{ type: 'SOLID', color: hexToRgb('#f8f9fa') }];
  for (const component of components) {
    try {
      const node = await renderComponent(component);
      mainFrame.appendChild(node);
    } catch (err) {
      console.error('Error creating node:', err);
    }
  }
  figma.currentPage.appendChild(mainFrame);
  figma.viewport.scrollAndZoomIntoView([mainFrame]);
  figma.notify(`✅ Успешно импортировано!`);
}
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export') {
    try {
      const data = JSON.parse(msg.data);
      await exportToFigma(data);
    } catch (error) {
      figma.ui.postMessage({ type: 'error', message: 'Ошибка парсинга данных' });
    }
  }
};
figma.showUI(__html__, { width: 400, height: 500 });
