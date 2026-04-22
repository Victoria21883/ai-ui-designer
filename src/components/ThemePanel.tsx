// src/components/ThemePanel.tsx
import React, { useState } from 'react';
import { useThemeStore } from '../store/themeStore';

interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
}

const ThemePanel: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [customColors, setCustomColors] = useState<CustomColors>({
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#8b5cf6',
    background: '#ffffff',
    surface: '#f3f4f6',
    textPrimary: '#111827',
  });

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    setCustomColors((prev) => ({ ...prev, [key]: value }));
    // Обновляем CSS переменную
    const cssVarName = `--color-${key === 'textPrimary' ? 'text-primary' : key}`;
    document.documentElement.style.setProperty(cssVarName, value);
  };

  const resetColors = () => {
    const defaultColors = {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#8b5cf6',
      background: '#ffffff',
      surface: '#f3f4f6',
      textPrimary: '#111827',
    };
    setCustomColors(defaultColors);

    // Сбрасываем CSS переменные
    Object.entries(defaultColors).forEach(([key, value]) => {
      const cssVarName = `--color-${key === 'textPrimary' ? 'text-primary' : key}`;
      document.documentElement.style.setProperty(cssVarName, value);
    });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Глобальные стили</h3>
        <div className="flex gap-2">
          <button onClick={resetColors} className="text-sm text-primary hover:text-primary-hover">
            Сбросить
          </button>
        </div>
      </div>

      {/* Переключатель темы */}
      <div className="p-3 bg-surface rounded-lg border border-border">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Тема</span>
          <button
            onClick={toggleTheme}
            className="px-3 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary-hover"
          >
            {theme === 'dark' ? '🌙 Темная' : '☀️ Светлая'}
          </button>
        </div>
      </div>

      {/* Настройка цветов */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-text-secondary">Цвета</h4>

        <ColorField
          label="Основной цвет"
          value={customColors.primary}
          onChange={(val) => handleColorChange('primary', val)}
        />

        <ColorField
          label="Вторичный цвет"
          value={customColors.secondary}
          onChange={(val) => handleColorChange('secondary', val)}
        />

        <ColorField
          label="Акцентный цвет"
          value={customColors.accent}
          onChange={(val) => handleColorChange('accent', val)}
        />

        <ColorField
          label="Цвет фона"
          value={customColors.background}
          onChange={(val) => handleColorChange('background', val)}
        />

        <ColorField
          label="Цвет поверхности"
          value={customColors.surface}
          onChange={(val) => handleColorChange('surface', val)}
        />

        <ColorField
          label="Цвет текста"
          value={customColors.textPrimary}
          onChange={(val) => handleColorChange('textPrimary', val)}
        />
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-text-secondary">
          💡 Изменения применяются ко всему интерфейсу в реальном времени
        </p>
      </div>
    </div>
  );
};

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

export default ThemePanel;
