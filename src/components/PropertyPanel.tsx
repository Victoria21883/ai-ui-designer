// src/components/PropertyPanel.tsx
import React from 'react';
import type { UIComponent } from '../types/types';

interface PropertyPanelProps {
  component: UIComponent | null;
  onUpdate: (updates: Partial<UIComponent>) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ component, onUpdate }) => {
  if (!component) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">Выберите компонент на холсте</p>
        <p className="text-xs text-text-secondary mt-2">
          👆 Кликните на любой компонент для редактирования
        </p>
      </div>
    );
  }

  const currentProps = component.props || {};

  const handleChange = (key: string, value: unknown) => {
    onUpdate({ props: { ...currentProps, [key]: value } });
  };

  // Общие поля для всех компонентов (цвет, размер, отступы)
  const renderCommonFields = () => (
    <div className="space-y-4 border-t border-border pt-4 mt-4">
      <h4 className="text-sm font-medium mb-3">Стилизация</h4>

      {/* Цвет текста */}
      <ColorField
        label="Цвет текста"
        value={(currentProps.color as string) || '#000000'}
        onChange={(val) => handleChange('color', val)}
      />

      {/* Цвет фона */}
      <ColorField
        label="Цвет фона"
        value={(currentProps.backgroundColor as string) || '#ffffff'}
        onChange={(val) => handleChange('backgroundColor', val)}
      />

      <div className="grid grid-cols-2 gap-2">
        {/* Ширина */}
        <TextField
          label="Ширина"
          value={(currentProps.width as string) || ''}
          onChange={(val) => handleChange('width', val)}
          placeholder="auto / 100% / 200px"
        />

        {/* Высота */}
        <TextField
          label="Высота"
          value={(currentProps.height as string) || ''}
          onChange={(val) => handleChange('height', val)}
          placeholder="auto / 100% / 200px"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Внешний отступ (margin) */}
        <TextField
          label="Внешний отступ"
          value={(currentProps.margin as string) || ''}
          onChange={(val) => handleChange('margin', val)}
          placeholder="0 / 4px / 1rem"
        />

        {/* Внутренний отступ (padding) */}
        <TextField
          label="Внутренний отступ"
          value={(currentProps.padding as string) || ''}
          onChange={(val) => handleChange('padding', val)}
          placeholder="0 / 4px / 1rem"
        />
      </div>

      {/* Скругление углов */}
      <TextField
        label="Скругление углов"
        value={(currentProps.borderRadius as string) || ''}
        onChange={(val) => handleChange('borderRadius', val)}
        placeholder="0 / 4px / 8px / 9999px"
      />
    </div>
  );

  const renderFields = () => {
    switch (component.type) {
      case 'button':
        return (
          <div className="space-y-4">
            {/* Текст кнопки */}
            <TextField
              label="Текст кнопки"
              value={(currentProps.text as string) || ''}
              onChange={(val) => handleChange('text', val)}
              placeholder="Например: Нажми меня"
            />

            <SelectField
              label="Вариант"
              value={(currentProps.variant as string) || 'primary'}
              options={[
                { value: 'primary', label: 'Основная' },
                { value: 'secondary', label: 'Вторичная' },
                { value: 'outline', label: 'Контурная' },
              ]}
              onChange={(val) => handleChange('variant', val)}
            />

            <SelectField
              label="Размер"
              value={(currentProps.size as string) || 'md'}
              options={[
                { value: 'sm', label: 'Маленькая' },
                { value: 'md', label: 'Средняя' },
                { value: 'lg', label: 'Большая' },
              ]}
              onChange={(val) => handleChange('size', val)}
            />

            {renderCommonFields()}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            {/* Текст */}
            <TextField
              label="Текст"
              value={(currentProps.content as string) || ''}
              onChange={(val) => handleChange('content', val)}
              placeholder="Введите текст..."
              multiline
            />

            <SelectField
              label="Размер заголовка"
              value={(currentProps.variant as string) || 'p'}
              options={[
                { value: 'h1', label: 'H1 - Самый большой' },
                { value: 'h2', label: 'H2 - Очень большой' },
                { value: 'h3', label: 'H3 - Большой' },
                { value: 'p', label: 'P - Обычный' },
                { value: 'span', label: 'Span - Маленький' },
              ]}
              onChange={(val) => handleChange('variant', val)}
            />

            {/* Выравнивание текста */}
            <SelectField
              label="Выравнивание"
              value={(currentProps.textAlign as string) || 'left'}
              options={[
                { value: 'left', label: 'По левому краю' },
                { value: 'center', label: 'По центру' },
                { value: 'right', label: 'По правому краю' },
              ]}
              onChange={(val) => handleChange('textAlign', val)}
            />

            {/* Жирность текста */}
            <SelectField
              label="Жирность"
              value={(currentProps.fontWeight as string) || 'normal'}
              options={[
                { value: 'normal', label: 'Обычный' },
                { value: 'bold', label: 'Жирный' },
                { value: 'light', label: 'Тонкий' },
              ]}
              onChange={(val) => handleChange('fontWeight', val)}
            />

            {renderCommonFields()}
          </div>
        );

      case 'input':
        return (
          <div className="space-y-4">
            <TextField
              label="Placeholder"
              value={(currentProps.placeholder as string) || ''}
              onChange={(val) => handleChange('placeholder', val)}
              placeholder="Например: Введите текст..."
            />

            <SelectField
              label="Тип поля"
              value={(currentProps.type as string) || 'text'}
              options={[
                { value: 'text', label: 'Текст' },
                { value: 'email', label: 'Email' },
                { value: 'password', label: 'Пароль' },
                { value: 'number', label: 'Число' },
              ]}
              onChange={(val) => handleChange('type', val)}
            />

            <TextField
              label="Label"
              value={(currentProps.label as string) || ''}
              onChange={(val) => handleChange('label', val)}
              placeholder="Метка над полем"
            />

            {renderCommonFields()}
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <TextField
              label="Заголовок"
              value={(currentProps.title as string) || ''}
              onChange={(val) => handleChange('title', val)}
              placeholder="Заголовок карточки"
            />

            <TextField
              label="Подзаголовок"
              value={(currentProps.subtitle as string) || ''}
              onChange={(val) => handleChange('subtitle', val)}
              placeholder="Подзаголовок карточки"
            />

            <SelectField
              label="Тень"
              value={(currentProps.elevation as string) || 'md'}
              options={[
                { value: 'none', label: 'Нет' },
                { value: 'sm', label: 'Маленькая' },
                { value: 'md', label: 'Средняя' },
                { value: 'lg', label: 'Большая' },
              ]}
              onChange={(val) => handleChange('elevation', val)}
            />

            {renderCommonFields()}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <TextField
              label="URL изображения"
              value={(currentProps.src as string) || ''}
              onChange={(val) => handleChange('src', val)}
              placeholder="https://example.com/image.jpg"
            />

            <TextField
              label="Alt текст"
              value={(currentProps.alt as string) || ''}
              onChange={(val) => handleChange('alt', val)}
              placeholder="Описание изображения"
            />

            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Ширина"
                value={(currentProps.width as string) || ''}
                onChange={(val) => handleChange('width', val)}
                placeholder="auto"
              />
              <TextField
                label="Высота"
                value={(currentProps.height as string) || ''}
                onChange={(val) => handleChange('height', val)}
                placeholder="auto"
              />
            </div>

            <SelectField
              label="Обрезка изображения"
              value={(currentProps.objectFit as string) || 'cover'}
              options={[
                { value: 'cover', label: 'Cover (заполнить)' },
                { value: 'contain', label: 'Contain (вписать)' },
                { value: 'fill', label: 'Fill (растянуть)' },
                { value: 'none', label: 'None' },
              ]}
              onChange={(val) => handleChange('objectFit', val)}
            />

            {renderCommonFields()}
          </div>
        );

      case 'container':
        return (
          <div className="space-y-4">
            <SelectField
              label="Направление"
              value={(currentProps.direction as string) || 'column'}
              options={[
                { value: 'column', label: 'Колонка (вертикально)' },
                { value: 'row', label: 'Строка (горизонтально)' },
              ]}
              onChange={(val) => handleChange('direction', val)}
            />

            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Отступ внутри"
                value={(currentProps.padding as string) || '4'}
                onChange={(val) => handleChange('padding', val)}
                placeholder="4"
              />
              <TextField
                label="Отступ между"
                value={(currentProps.gap as string) || '4'}
                onChange={(val) => handleChange('gap', val)}
                placeholder="4"
              />
            </div>

            <SelectField
              label="Выравнивание по горизонтали"
              value={(currentProps.justify as string) || 'start'}
              options={[
                { value: 'start', label: 'Начало' },
                { value: 'center', label: 'Центр' },
                { value: 'end', label: 'Конец' },
                { value: 'between', label: 'Между' },
              ]}
              onChange={(val) => handleChange('justify', val)}
            />

            <SelectField
              label="Выравнивание по вертикали"
              value={(currentProps.align as string) || 'start'}
              options={[
                { value: 'start', label: 'Начало' },
                { value: 'center', label: 'Центр' },
                { value: 'end', label: 'Конец' },
              ]}
              onChange={(val) => handleChange('align', val)}
            />

            {renderCommonFields()}
          </div>
        );

      default:
        return <div className="space-y-4">{renderCommonFields()}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Информация о компоненте */}
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
        <p className="text-primary font-medium flex items-center gap-2">
          <span>✅</span> Выбран компонент
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-xs">
            <span className="text-text-secondary">Тип:</span>{' '}
            <span className="text-text-primary font-medium">{component.type}</span>
          </p>
          <p className="text-xs">
            <span className="text-text-secondary">ID:</span>{' '}
            <span className="text-text-primary font-mono">{component.id.slice(0, 12)}...</span>
          </p>
        </div>
      </div>

      {/* Редактируемые поля */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium mb-3">Редактируемые свойства</h4>
        {renderFields()}
      </div>

      {/* CSS классы (для продвинутых пользователей) */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium mb-3">Дополнительно</h4>
        <TextField
          label="CSS классы (Tailwind)"
          value={(currentProps.className as string) || ''}
          onChange={(val) => handleChange('className', val)}
          placeholder="px-4 py-2 bg-blue-500 text-white rounded"
          multiline
        />
        <p className="text-xs text-text-secondary mt-1">
          💡 Примеры: <code className="bg-gray-100 px-1 rounded">mt-4</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">text-center</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">bg-red-500</code>
        </p>
      </div>
    </div>
  );
};

// Компонент для выбора цвета
const ColorField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border border-border rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

// TextField компонент (остается без изменений)
const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}> = ({ label, value, onChange, placeholder, multiline }) => {
  const Component = multiline ? 'textarea' : 'input';
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
      <Component
        className="w-full p-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 3 : 1}
      />
    </div>
  );
};

// SelectField компонент (остается без изменений)
const SelectField: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
      <select
        className="w-full p-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PropertyPanel;
