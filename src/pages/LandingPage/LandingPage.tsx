// src/pages/LandingPage/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-surface">
      {/* Навигация */}
      <nav className="bg-surface/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">AI UI Designer</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/editor" className="text-text-secondary hover:text-primary">
                Редактор
              </Link>
              <Link to="/preview/demo" className="text-text-secondary hover:text-primary">
                Демо
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero секция */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-text-primary mb-6">
            Создавайте интерфейсы с помощью
            <span className="text-primary"> AI</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Опишите желаемый интерфейс текстом, и AI создаст его за секунды. Редактируйте,
            экспортируйте в HTML или Figma.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/editor">
              <button className="btn-primary px-8 py-3 text-lg">Начать бесплатно</button>
            </Link>
            <Link to="/preview/demo">
              <button className="btn-secondary px-8 py-3 text-lg">Посмотреть демо</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features секция */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">AI Генерация</h3>
            <p className="text-text-secondary">
              Просто опишите, что хотите создать, и AI сделает весь макет за вас
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Drag & Drop</h3>
            <p className="text-text-secondary">Редактируйте макет в удобном визуальном редакторе</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Экспорт в Figma</h3>
            <p className="text-text-secondary">
              Экспортируйте готовый дизайн прямо в Figma или HTML
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
