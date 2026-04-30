// src/utils/htmlExporter.ts
import type { UIComponent } from '../types/types';

// Типы пропсов для разных компонентов
interface ButtonProps {
  text?: string;
  className?: string;
  variant?: string;
  size?: string;
  disabled?: boolean;
}

interface TextProps {
  content?: string;
  variant?: string;
  className?: string;
}

interface InputProps {
  placeholder?: string;
  type?: string;
  label?: string;
  className?: string;
}

interface CardProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

interface ContainerProps {
  direction?: string;
  justify?: string;
  align?: string;
  gap?: string;
  className?: string;
  children?: React.ReactNode;
}

interface ImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  className?: string;
}

/**
 * Рекурсивно преобразует UIComponent в HTML строку
 */
export function generateHTML(components: UIComponent[]): string {
  if (!components || components.length === 0) {
    return '<div class="text-center text-gray-400 py-12">✨ Холст пуст</div>';
  }

  return components.map((component) => renderComponent(component)).join('\n');
}

/**
 * Рендерит один компонент в HTML строку
 */
function renderComponent(component: UIComponent): string {
  const { type, props = {}, children, styles } = component;

  // Базовые классы из пропсов
  let className = (props.className as string) || '';

  // Добавляем стили из styles
  const styleAttr = styles ? objectToInlineStyles(styles as Record<string, string>) : '';

  // Добавляем дополнительные классы в зависимости от типа
  className = addBaseClasses(type, className);

  switch (type) {
    case 'button':
      return renderButton(props as ButtonProps, className, styleAttr);

    case 'text':
      return renderText(props as TextProps, className, styleAttr);

    case 'input':
      return renderInput(props as InputProps, className, styleAttr);

    case 'card':
      return renderCard(props as CardProps, className, styleAttr, children as UIComponent[]);

    case 'container':
      return renderContainer(
        props as ContainerProps,
        className,
        styleAttr,
        children as UIComponent[]
      );

    case 'image':
      return renderImage(props as ImageProps, className, styleAttr);

    default:
      return `<div class="${className}"${styleAttr ? ` style="${styleAttr}"` : ''}>${props.text || props.content || ''}</div>`;
  }
}

/**
 * Рендерит кнопку
 */
function renderButton(props: ButtonProps, className: string, styleAttr: string): string {
  const { text, disabled } = props;
  const disabledAttr = disabled ? ' disabled' : '';

  return `<button class="${className}"${disabledAttr}${styleAttr ? ` style="${styleAttr}"` : ''}>
  ${text || 'Кнопка'}
</button>`;
}

/**
 * Рендерит текст
 */
function renderText(props: TextProps, className: string, styleAttr: string): string {
  const { content, variant = 'p' } = props;
  const tag = getTextTag(variant);
  const text = content || '';

  return `<${tag} class="${className}"${styleAttr ? ` style="${styleAttr}"` : ''}>
  ${escapeHtml(text)}
</${tag}>`;
}

/**
 * Рендерит поле ввода
 */
function renderInput(props: InputProps, className: string, styleAttr: string): string {
  const { placeholder = '', type = 'text', label = '' } = props;

  let html = '';

  if (label) {
    html += `<label class="block text-sm font-medium text-gray-700 mb-1">${escapeHtml(label)}</label>`;
  }

  html += `<input type="${type}" placeholder="${escapeHtml(placeholder)}" class="${className}"${styleAttr ? ` style="${styleAttr}"` : ''}>`;

  return html;
}

/**
 * Рендерит карточку
 */
function renderCard(
  props: CardProps,
  className: string,
  styleAttr: string,
  children?: UIComponent[]
): string {
  const { title, subtitle } = props;

  let html = `<div class="${className}"${styleAttr ? ` style="${styleAttr}"` : ''}>`;

  if (title) {
    html += `<h3 class="text-lg font-semibold mb-2">${escapeHtml(title)}</h3>`;
  }

  if (subtitle) {
    html += `<p class="text-gray-600 mb-4">${escapeHtml(subtitle)}</p>`;
  }

  if (children && children.length > 0) {
    html += children.map((child) => renderComponent(child)).join('\n');
  }

  html += '</div>';

  return html;
}

/**
 * Рендерит контейнер
 */
function renderContainer(
  props: ContainerProps,
  className: string,
  styleAttr: string,
  children?: UIComponent[]
): string {
  let html = `<div class="${className}"${styleAttr ? ` style="${styleAttr}"` : ''}>`;

  if (children && children.length > 0) {
    html += children.map((child) => renderComponent(child)).join('\n');
  }

  html += '</div>';

  return html;
}

/**
 * Рендерит изображение
 */
function renderImage(props: ImageProps, className: string, styleAttr: string): string {
  const { src = 'https://via.placeholder.com/150', alt = 'Изображение', width, height } = props;

  const widthAttr = width ? ` width="${width}"` : '';
  const heightAttr = height ? ` height="${height}"` : '';

  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${className}"${widthAttr}${heightAttr}${styleAttr ? ` style="${styleAttr}"` : ''}>`;
}

/**
 * Определяет HTML тег для текста
 */
function getTextTag(variant: string): string {
  const tagMap: Record<string, string> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    span: 'span',
    div: 'div',
  };

  return tagMap[variant] || 'p';
}

/**
 * Добавляет базовые классы в зависимости от типа компонента
 */
function addBaseClasses(type: string, existingClasses: string): string {
  const baseClasses: string[] = existingClasses ? existingClasses.split(' ') : [];

  switch (type) {
    case 'button':
      if (!existingClasses.includes('bg-') && !existingClasses.includes('px-')) {
        baseClasses.push(
          'px-4',
          'py-2',
          'bg-blue-500',
          'text-white',
          'rounded',
          'hover:bg-blue-600',
          'transition-colors'
        );
      }
      break;

    case 'input':
      if (!existingClasses.includes('border')) {
        baseClasses.push(
          'w-full',
          'p-2',
          'border',
          'border-gray-300',
          'rounded',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-blue-500'
        );
      }
      break;

    case 'card':
      if (!existingClasses.includes('shadow')) {
        baseClasses.push('bg-white', 'rounded-lg', 'shadow-md', 'border', 'border-gray-200', 'p-4');
      }
      break;

    case 'container':
      if (!existingClasses.includes('flex')) {
        baseClasses.push('flex', 'flex-col', 'gap-4');
      }
      break;
  }

  return baseClasses.join(' ');
}

/**
 * Преобразует объект стилей в строку для HTML
 */
function objectToInlineStyles(styles: Record<string, string>): string {
  const styleEntries = Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      // Преобразуем camelCase в kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    });

  return styleEntries.join('; ');
}

/**
 * Экранирует HTML специальные символы
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Генерирует полный HTML документ
 */
export function generateFullHTML(
  components: UIComponent[],
  title: string = 'AI UI Designer'
): string {
  const bodyContent = generateHTML(components);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .preview-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      padding: 2rem;
    }
    
    /* Анимации */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .preview-container > * {
      animation: fadeIn 0.3s ease-out;
    }
  </style>
</head>
<body>
  <div class="preview-container">
    ${bodyContent}
  </div>
</body>
</html>`;
}
