import React, { useState, useEffect } from 'react';
import type { UIComponent } from '../types/types';

interface FigmaExportButtonProps {
  components: UIComponent[];
  projectName: string;
  theme?: Record<string, unknown>;
}

const FigmaExportButton: React.FC<FigmaExportButtonProps> = ({
  components,
  projectName,
  theme,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    console.log('=== FIGMA EXPORT BUTTON DEBUG ===');
    console.log('components:', components);
    console.log('components.length:', components?.length);
    console.log('projectName:', projectName);
    console.log('================================');
  }, [components, projectName]);

  const getExportData = () => {
    if (components && components.length > 0) {
      return {
        components: components,
        projectName: projectName,
        theme: theme || { colors: {} },
        timestamp: new Date().toISOString(),
      };
    }

    console.warn('⚠️ Нет реальных компонентов, создаем тестовые данные');
    return {
      projectName: projectName || 'Тестовый проект',
      components: [
        {
          id: 'test-btn-1',
          type: 'button',
          props: { text: 'Тестовая кнопка' },
          styles: { backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '8' },
        },
        {
          id: 'test-text-1',
          type: 'text',
          props: { content: 'Привет из AI UI Designer!' },
          styles: { color: '#000000', fontSize: '16' },
        },
      ],
      theme: { colors: {} },
      timestamp: new Date().toISOString(),
    };
  };

  const exportData = getExportData();
  const dataStr = JSON.stringify(exportData, null, 2);
  const encodedData = encodeURIComponent(dataStr);

  const copyToClipboard = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(dataStr);
      alert(
        `✅ Данные скопированы!\n\nПроект: ${exportData.projectName}\nКомпонентов: ${exportData.components.length}\n\nJSON в буфере обмена.`
      );
    } catch {
      alert('❌ Не удалось скопировать.');
    } finally {
      setIsCopying(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await navigator.clipboard.writeText(dataStr);

      const figmaUrl = `figma://plugin/ai-ui-designer-export?data=${encodedData}`;
      window.location.href = figmaUrl;

      setTimeout(() => {
        alert(
          ` Запрос отправлен в Figma!\n\nПроект: ${exportData.projectName}\nКомпонентов: ${exportData.components.length}\n\nЕсли Figma не открылась автоматически, используйте кнопку "Скопировать JSON" и вставьте его в плагин вручную.`
        );
      }, 500);
    } catch (err) {
      console.error('Ошибка экспорта:', err);
      alert('❌ Ошибка при попытке экспорта.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-2 p-1 bg-gray-100 rounded text-xs text-center">
        📊 Компонентов: {components?.length || 0}
        {(!components || components.length === 0) && ' (используются тестовые)'}
      </div>

      <button
        onClick={copyToClipboard}
        disabled={isCopying}
        className="w-full mb-2 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        {isCopying ? ' Копирование...' : ' Скопировать JSON в буфер'}
      </button>

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        {isExporting ? ' Открытие Figma...' : '🎨 Экспорт в Figma'}
      </button>
    </div>
  );
};

export default FigmaExportButton;
