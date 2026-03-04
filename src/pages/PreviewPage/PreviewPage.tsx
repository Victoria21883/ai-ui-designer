// src/pages/PreviewPage/PreviewPage.tsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const PreviewPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      {/* Верхняя панель */}
      <nav className="bg-surface border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/editor" className="text-2xl font-bold text-primary">
            AI UI Designer
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-text-secondary">Просмотр макета #{id}</span>
            <Link to="/editor">
              <button className="btn-secondary">Вернуться к редактированию</button>
            </Link>
            <button className="btn-primary">Экспорт в HTML</button>
          </div>
        </div>
      </nav>

      {/* Область предпросмотра */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-surface rounded-lg p-8 border border-border">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Пример макета</h1>
          <p className="text-text-secondary mb-6">
            Здесь будет отображаться ваш сгенерированный интерфейс
          </p>

          {/* Демо-интерфейс */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button className="btn-primary">Кнопка входа</button>
              <button className="btn-secondary">Отмена</button>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Пример карточки</h3>
              <p className="text-text-secondary">Здесь может быть ваше содержимое</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
