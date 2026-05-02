import React from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import type { UIComponent } from '../../types/types';

const DEFAULT_DEMO: UIComponent[] = [
  {
    id: 'demo-hero',
    type: 'container',
    props: {
      className:
        'bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-16 text-center rounded-xl mb-8',
    },
    children: [
      {
        id: 'demo-title',
        type: 'text',
        props: { content: 'Ваш AI Интерфейс', className: 'text-5xl font-extrabold mb-4' },
      },
      {
        id: 'demo-subtitle',
        type: 'text',
        props: {
          content:
            'Это демонстрационный макет. Начните генерировать в редакторе, чтобы увидеть здесь свой проект.',
          className: 'text-xl opacity-90 mb-8',
        },
      },
      {
        id: 'demo-btn',
        type: 'button',
        props: {
          text: 'Попробовать редактор',
          className:
            'bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg',
        },
      },
    ],
  },
  {
    id: 'demo-grid',
    type: 'container',
    props: { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
    children: [
      {
        id: 'c1',
        type: 'card',
        props: { className: 'p-6 bg-gray-50 border rounded-xl hover:shadow-md transition-shadow' },
        children: [
          {
            id: 't1',
            type: 'text',
            props: { content: '🚀 Быстрая генерация', className: 'font-bold' },
          },
        ],
      },
      {
        id: 'c2',
        type: 'card',
        props: { className: 'p-6 bg-gray-50 border rounded-xl hover:shadow-md transition-shadow' },
        children: [
          {
            id: 't2',
            type: 'text',
            props: { content: '🎨 Удобный дизайн', className: 'font-bold' },
          },
        ],
      },
      {
        id: 'c3',
        type: 'card',
        props: { className: 'p-6 bg-gray-50 border rounded-xl hover:shadow-md transition-shadow' },
        children: [
          {
            id: 't3',
            type: 'text',
            props: { content: '📱 Адаптивная верстка', className: 'font-bold' },
          },
        ],
      },
    ],
  },
];

const PreviewPage: React.FC = () => {
  const { currentProject } = useProjectStore();

  const componentsToRender =
    currentProject?.components && currentProject.components.length > 0
      ? currentProject.components
      : DEFAULT_DEMO;

  const renderComponent = (comp: UIComponent): React.ReactNode => {
    const { type, props, children, id } = comp;
    const baseClass = (props.className as string) || '';

    switch (type) {
      case 'button':
        return (
          <button key={id} className={baseClass}>
            {(props.text as string) || (props.content as string) || 'Кнопка'}
          </button>
        );
      case 'input':
        return (
          <input
            key={id}
            type="text"
            placeholder={props.placeholder as string}
            className={baseClass}
          />
        );
      case 'text':
        return (
          <p key={id} className={baseClass}>
            {(props.content as string) || (props.text as string)}
          </p>
        );
      case 'card':
      case 'container':
        return (
          <div key={id} className={baseClass}>
            {children?.map((child) => renderComponent(child))}
          </div>
        );
      case 'image':
        return (
          <img key={id} src={props.src as string} alt={props.alt as string} className={baseClass} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Панель управления */}
      <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-bold text-blue-400 hover:text-blue-300">
            AI UI Designer
          </Link>
          <span className="text-gray-600">|</span>
          <div className="flex flex-col">
            <span className="text-xs uppercase text-gray-500 font-bold tracking-wider">
              Режим просмотра
            </span>
            <span className="text-sm font-medium">
              {currentProject?.components.length ? `Проект: ${currentProject.name}` : 'Демо-версия'}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/editor">
            <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105">
              {currentProject?.components.length ? 'Вернуться в редактор' : 'Начать создавать'}
            </button>
          </Link>
        </div>
      </nav>

      {/* Основной контент */}
      <div className="max-w-6xl mx-auto p-4 md:p-12">
        {/* Индикатор демо-режима */}
        {(!currentProject || currentProject.components.length === 0) && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm flex items-center gap-3">
            <span>💡</span>
            <span>
              Это пример того, что может создать наш AI. Перейдите в редактор, чтобы создать свой
              уникальный дизайн!
            </span>
          </div>
        )}

        <div className="transition-all duration-500">
          {componentsToRender.map((comp) => renderComponent(comp))}
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
