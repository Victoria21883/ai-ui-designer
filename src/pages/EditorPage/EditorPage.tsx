// src/pages/EditorPage/EditorPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EditorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Верхняя панель */}
      <nav className="bg-surface border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            AI UI Designer
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/preview/current">
              <button className="btn-secondary">Предпросмотр</button>
            </Link>
            <button className="btn-primary">Экспорт</button>
          </div>
        </div>
      </nav>

      {/* Панель генерации */}
      <div className="border-b border-border p-6 bg-surface/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Опишите интерфейс... (например: 'Сделай страницу входа с формой и кнопкой')"
              className="input flex-1"
            />
            <button className="btn-primary whitespace-nowrap">Сгенерировать</button>
          </div>
        </div>
      </div>

      {/* Основная область редактора */}
      <div className="flex h-[calc(100vh-180px)]">
        {/* Левая панель - компоненты */}
        <aside className="w-64 bg-surface border-r border-border p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Компоненты</h3>
          <div className="space-y-2">
            <div className="p-3 bg-background rounded border border-border cursor-move hover:border-primary">
              Кнопка
            </div>
            <div className="p-3 bg-background rounded border border-border cursor-move hover:border-primary">
              Текст
            </div>
            <div className="p-3 bg-background rounded border border-border cursor-move hover:border-primary">
              Карточка
            </div>
            <div className="p-3 bg-background rounded border border-border cursor-move hover:border-primary">
              Поле ввода
            </div>
          </div>
        </aside>

        {/* Центральная область - холст */}
        <main className="flex-1 bg-[#f8f9fa] p-8 overflow-auto">
          <div className="min-h-full bg-white rounded-lg shadow-sm border-2 border-dashed border-border p-8">
            <div className="text-center text-text-secondary">
              <p className="mb-4">✨ Холст для редактирования</p>
              <p className="text-sm">Перетащите компоненты сюда или сгенерируйте макет через AI</p>
            </div>
          </div>
        </main>

        {/* Правая панель - свойства */}
        <aside className="w-80 bg-surface border-l border-border p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Свойства</h3>
          <div className="text-text-secondary text-sm">
            Выберите компонент на холсте для редактирования свойств
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EditorPage;
