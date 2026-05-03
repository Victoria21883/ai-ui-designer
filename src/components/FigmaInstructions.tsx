import React, { useState } from 'react';

const FigmaInstructions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-text-secondary hover:text-primary transition-colors"
      >
        📖 Как экспортировать в Figma?
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">🎨 Экспорт в Figma</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📌 Важно</h3>
                <p className="text-sm text-blue-700">
                  Экспорт в Figma требует установки специального плагина. Следуйте инструкции ниже.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                    1
                  </span>
                  Установите плагин
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">Скачайте файлы плагина:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                    <li>manifest.json</li>
                    <li>code.js (скомпилированный из code.ts)</li>
                    <li>ui.html</li>
                  </ul>
                  <button
                    onClick={() => {
                      // Создаем архив с файлами плагина
                      alert('Функция скачивания архива будет добавлена');
                    }}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    📥 Скачать плагин
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                    2
                  </span>
                  Загрузите плагин в Figma
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 ml-4">
                    <li>Откройте Figma Desktop</li>
                    <li>
                      Нажмите на главное меню → <strong>Plugins</strong> →{' '}
                      <strong>Development</strong> → <strong>Import plugin from manifest...</strong>
                    </li>
                    <li>Выберите папку с файлами плагина</li>
                    <li>
                      Плагин появится в списке{' '}
                      <strong>Plugins → Development → AI UI Designer Export</strong>
                    </li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                    3
                  </span>
                  Используйте экспорт
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 ml-4">
                    <li>
                      В AI UI Designer нажмите <strong>"Экспорт в Figma"</strong>
                    </li>
                    <li>Данные будут скопированы в буфер обмена</li>
                    <li>
                      В Figma запустите плагин:{' '}
                      <strong>Plugins → Development → AI UI Designer Export</strong>
                    </li>
                    <li>
                      Нажмите <strong>"Экспортировать в Figma"</strong> в окне плагина
                    </li>
                    <li>Готово! Макет появится на канвасе</li>
                  </ol>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">💡 Совет</h3>
                <p className="text-sm text-yellow-700">
                  После импорта компоненты будут сгруппированы в frame. Вы можете редактировать их
                  как обычные Figma-слои.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FigmaInstructions;
