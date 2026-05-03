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

  const renderCommonFields = () => (
    <div className="space-y-4 border-t border-border pt-4 mt-4">
      <h4 className="text-sm font-medium mb-3 text-primary uppercase tracking-wider text-[10px]">
        Стилизация и размеры
      </h4>

      <div className="grid grid-cols-2 gap-2">
        <TextField
          label="Ширина (W)"
          value={(currentProps.width as string) || ''}
          onChange={(val) => handleChange('width', val)}
          placeholder="100% или 200px"
        />
        <TextField
          label="Высота (H)"
          value={(currentProps.height as string) || ''}
          onChange={(val) => handleChange('height', val)}
          placeholder="auto или 200px"
        />
      </div>

      <ColorField
        label="Цвет текста"
        value={(currentProps.color as string) || '#000000'}
        onChange={(val) => handleChange('color', val)}
      />

      <ColorField
        label="Цвет фона"
        value={(currentProps.backgroundColor as string) || '#ffffff'}
        onChange={(val) => handleChange('backgroundColor', val)}
      />

      <div className="grid grid-cols-2 gap-2">
        <TextField
          label="Margin (Внешний)"
          value={(currentProps.margin as string) || ''}
          onChange={(val) => handleChange('margin', val)}
          placeholder="10px"
        />
        <TextField
          label="Padding (Внутр.)"
          value={(currentProps.padding as string) || ''}
          onChange={(val) => handleChange('padding', val)}
          placeholder="10px"
        />
      </div>

      <TextField
        label="Скругление (px)"
        value={(currentProps.borderRadius as string) || ''}
        onChange={(val) => handleChange('borderRadius', val)}
        placeholder="8"
      />
    </div>
  );

  const renderFields = () => {
    switch (component.type) {
      case 'image':
        return (
          <div className="space-y-4">
            <TextField
              label="Прямая ссылка на картинку"
              value={(currentProps.src as string) || ''}
              onChange={(val) => handleChange('src', val)}
              placeholder="https://example.com/image.jpg"
            />

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">
                Или загрузить с компьютера
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleChange('src', reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <TextField
              label="Описание (Alt)"
              value={(currentProps.alt as string) || ''}
              onChange={(val) => handleChange('alt', val)}
              placeholder="Что изображено на фото"
            />

            <SelectField
              label="Заполнение (Object Fit)"
              value={(currentProps.objectFit as string) || 'cover'}
              options={[
                { value: 'cover', label: 'Заполнить (Cover)' },
                { value: 'contain', label: 'Вписать (Contain)' },
                { value: 'fill', label: 'Растянуть (Fill)' },
              ]}
              onChange={(val) => handleChange('objectFit', val)}
            />
            {renderCommonFields()}
          </div>
        );

      case 'container':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-md border border-dashed border-gray-300">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                Настройки сетки (Flex)
              </p>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => handleChange('direction', 'row')}
                  className={`flex-1 p-2 border rounded text-xs transition-all ${currentProps.direction === 'row' ? 'bg-primary text-white' : 'bg-white'}`}
                >
                  ↔️ В ряд
                </button>
                <button
                  onClick={() => handleChange('direction', 'column')}
                  className={`flex-1 p-2 border rounded text-xs transition-all ${currentProps.direction !== 'row' ? 'bg-primary text-white' : 'bg-white'}`}
                >
                  ↕️ В колонку
                </button>
              </div>

              <SelectField
                label="По горизонтали"
                value={(currentProps.justify as string) || 'start'}
                options={[
                  { value: 'start', label: 'Слева' },
                  { value: 'center', label: 'По центру' },
                  { value: 'end', label: 'Справа' },
                  { value: 'between', label: 'Растянуть (Space)' },
                ]}
                onChange={(val) => handleChange('justify', val)}
              />

              <div className="mt-3">
                <SelectField
                  label="По вертикали"
                  value={(currentProps.align as string) || 'start'}
                  options={[
                    { value: 'start', label: 'Сверху' },
                    { value: 'center', label: 'Посередине' },
                    { value: 'end', label: 'Снизу' },
                  ]}
                  onChange={(val) => handleChange('align', val)}
                />
              </div>

              <div className="mt-3">
                <TextField
                  label="Расстояние между (Gap px)"
                  value={(currentProps.gap as string) || '10'}
                  onChange={(val) => handleChange('gap', val)}
                />
              </div>
            </div>
            {renderCommonFields()}
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <TextField
              label="Текст кнопки"
              value={(currentProps.text as string) || ''}
              onChange={(val) => handleChange('text', val)}
            />
            {renderCommonFields()}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <TextField
              label="Содержимое"
              value={(currentProps.content as string) || ''}
              onChange={(val) => handleChange('content', val)}
              multiline
            />
            {renderCommonFields()}
          </div>
        );

      default:
        return renderCommonFields();
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
        <p className="text-primary text-xs font-bold uppercase tracking-widest">
          Выбран: {component.type}
        </p>
      </div>

      <div className="border-t border-border pt-4">{renderFields()}</div>

      <div className="border-t border-border pt-4">
        <TextField
          label="Доп. Tailwind классы"
          value={(currentProps.className as string) || ''}
          onChange={(val) => handleChange('className', val)}
          placeholder="shadow-lg p-5"
        />
      </div>
    </div>
  );
};

const ColorField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
    <div className="flex gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-xs border rounded p-1"
      />
    </div>
  </div>
);

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}> = ({ label, value, onChange, placeholder, multiline }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
    {multiline ? (
      <textarea
        className="w-full text-xs border rounded p-2 bg-gray-50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    ) : (
      <input
        className="w-full text-xs border rounded p-2 bg-gray-50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
    <select
      className="w-full text-xs border rounded p-2 bg-gray-50 cursor-pointer"
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

export default PropertyPanel;
