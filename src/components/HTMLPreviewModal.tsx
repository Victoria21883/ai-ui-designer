import React, { useState, useMemo } from 'react';
import { generateFullHTML } from '../utils/htmlExporter';
import type { UIComponent } from '../types/types';

interface HTMLPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: UIComponent[];
  projectName: string;
}

const HTMLPreviewModal: React.FC<HTMLPreviewModalProps> = ({
  isOpen,
  onClose,
  components,
  projectName,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const htmlContent = useMemo(() => {
    if (!isOpen) return '';
    return generateFullHTML(components, projectName);
  }, [isOpen, components, projectName]);

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'project'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка при скачивании:', err);
    }
  };

  const handleCopyHTML = () => {
    navigator.clipboard.writeText(htmlContent);
    alert('HTML скопирован в буфер обмена!');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`bg-white rounded-xl shadow-2xl flex flex-col ${isFullscreen ? 'w-full h-full m-4' : 'w-[90vw] h-[85vh]'}`}
      >
        {/* Заголовок */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">📄 Предпросмотр HTML</h2>
          <div className="flex gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
            >
              {isFullscreen ? '🗗' : '🗖'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Инструменты */}
        <div className="flex gap-3 p-4 bg-gray-50 border-b border-gray-200">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            💾 Скачать HTML
          </button>
          <button
            onClick={handleCopyHTML}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            📋 Копировать код
          </button>
          <button
            onClick={() =>
              window.open(`data:text/html,${encodeURIComponent(htmlContent)}`, '_blank')
            }
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            🔍 Открыть в новой вкладке
          </button>
        </div>

        {/* Превью HTML */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="border border-gray-200 rounded-lg overflow-hidden h-full">
            <iframe
              srcDoc={htmlContent}
              title="HTML Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            />
          </div>
        </div>

        {/* Подсказка */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          💡 Совет: Используйте кнопку "Скачать HTML", чтобы сохранить файл, или "Открыть в новой
          вкладке" для полноценного просмотра.
        </div>
      </div>
    </div>
  );
};

export default HTMLPreviewModal;
