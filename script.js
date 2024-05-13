let isEditableTableCreated = false; // Флаг для отслеживания, создана ли редактируемая таблица
// Функция для подсветки активной вкладки
function highlightTab(tabName) {
    const buttons = document.querySelectorAll('.tabButton');
    buttons.forEach((button) => {
      button.classList.remove('active'); // Убираем выделение
      if (button.getAttribute('aria-controls') === tabName) {
        button.classList.add('active'); // Подсвечиваем активную вкладку
      }
    });
  }
  
  // Функция переключения вкладок
  function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab) => {
      tab.style.display = 'none'; // Скрываем все вкладки
    });
  
    const tabToDisplay = document.getElementById(tabName);
    if (tabToDisplay) {
      tabToDisplay.style.display = 'block'; // Показываем нужную вкладку
    }
  
    highlightTab(tabName); // Подсвечиваем активную вкладку

    // Проверяем, если открывается вкладка "editTab"
    if (tabName === 'editTab') {
        if (!isEditableTableCreated) {
            const data = getTableData(); // Получаем данные из существующей таблицы или других источников
            createEditableTable(data); // Создаем редактируемую таблицу, если она еще не создана
            isEditableTableCreated = true; // Устанавливаем флаг, чтобы избежать повторного создания
          }
    }
    
    if (tabName === 'statsTab') {
        createStatsTable(); // Создаем таблицу статистики по классам
        createStudentStatsTable() // Создаем таблицу статистики по студентам
      }

    if (tabName === 'graphTab') {
        getChartData(); // Собираем данные с таблиц для построения графиков
        createCharts(); // Строим графики
    }
  }
  
  // Привязка событий к кнопкам вкладок
  document.querySelectorAll('.tabButton').forEach((button) => {
    button.addEventListener('click', (event) => {
      const tabName = button.getAttribute('aria-controls');
      openTab(tabName); // Переключаемся на нужную вкладку
    });
  });
  
  // Привязка событий к кнопкам возврата на вкладку по умолчанию
  document.querySelectorAll('[onclick="openTab(\'defaultTab\')"]').forEach((button) => {
    button.addEventListener('click', () => {
      openTab('defaultTab'); // Возвращаемся на вкладку по умолчанию
    });
  });
  
  // Открытие вкладки по умолчанию при загрузке страницы
  document.addEventListener('DOMContentLoaded', () => {
    openTab('defaultTab'); // Открываем вкладку по умолчанию
  });

  // Подключаем необходимые библиотеки
  document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const dataPreview = document.getElementById('data-preview');
  
    if (!dataPreview) {
      console.error("Element with ID 'data-preview' not found."); // Выводим сообщение, если элемент не найден
      return;
    }
  
    // Открываем диалог выбора файла при нажатии кнопки
    uploadButton.addEventListener('click', () => {
      if (fileInput) {
        fileInput.click(); // Открываем диалог выбора файла
      }
    });
  
    // Обрабатываем загрузку файла
    fileInput.addEventListener('change', () => {
      const selectedFile = fileInput.files[0];
      if (selectedFile) {
        const fileReader = new FileReader();
        const fileType = selectedFile.name.split('.').pop().toLowerCase(); // Расширение файла
  
        fileReader.onload = (e) => {
          if (fileType === 'csv' || fileType === 'txt') {
            parseTextFile(e.target.result, fileType);
          } else if (fileType === 'xlsx' || fileType === 'xls') {
            parseExcelFile(e.target.result);
          }
        };
  
        if (fileType === 'csv' || fileType === 'txt') {
          fileReader.readAsText(selectedFile); // Считываем как текст
        } else if (fileType === 'xlsx' || 'xls') {
          fileReader.readAsArrayBuffer(selectedFile); // Считываем как массив байтов
        }
      }
    });
  
    // Парсинг файлов .xlsx и .xls
    function parseExcelFile(content) {
      const workbook = XLSX.read(new Uint8Array(content), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).slice(1); // Пропускаем заголовок
      createTable(data);
    }

    // Функция для обработки TXT и CSV-файлов
    function parseTextFile(content) {
        // Предлагаем несколько возможных разделителей
        const possibleSeparators = [',', ';', '\t'];
        let data = null;
    
        // Пробуем каждый разделитель
        for (const separator of possibleSeparators) {
        const rows = content.split('\n').map(row => row.trim()); // Разделяем по строкам, убирая пробелы в начале и конце
        data = rows.slice(1).map(row => row.split(separator).map(col => col.trim())); // Пропускаем заголовок и разбиваем строки
    
        if (data[0].length > 1) {
            break; // Если данные корректно разбиваются, выходим из цикла
        }
        }
    
        // Проверяем корректность данных
        if (data && data[0].length > 1) {
        createTable(data); // Создаём таблицу, если данные корректны
        } else {
        console.error("Could not determine the correct separator for CSV file");
        }
    }
  
    // Функция для создания таблицы
    function createTable(data) {
        const dataPreview = document.getElementById('data-preview');
      
        if (!dataPreview) {
          console.error("Element 'data-preview' not found when creating table");
          return;
        }
      
        const headers = ['Имя', 'Класс', 'Информатика', 'Физика', 'Математика', 'Литература', 'Музыка', 'Действия'];
        let html = '<table>';
        html += '<thead><tr>';
      
        headers.forEach(header => {
          html += `<th>${header}</th>`;
        });
      
        html += '</tr></thead>';
        html += '<tbody>';
      
        data.forEach((row, rowIndex) => {
          html += '<tr>';
      
          row.forEach((cell, colIndex) => {
            const safeValue = (cell !== null && cell !== undefined) ? cell.toString().trim() : '';
            html += `<td>${safeValue}</td>`;
          });
      
          html += `<td><button class="delete-btn" data-row-index="${rowIndex}">Удалить</button></td>`; // Кнопка удаления
          html += '</tr>';
        });
      
        html += '</tbody>';
        html += '</table>';
      
        dataPreview.innerHTML = html; // Добавляем таблицу в контейнер
        setupDeleteButtons(); // Устанавливаем обработчики кнопок "Удалить"
      }
  
    // Функция установки обработчиков событий для кнопок "Удалить"
    function setupDeleteButtons() {
      const buttons = document.querySelectorAll('.delete-btn');
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const row = button.closest('tr'); // Находим строку, к которой привязана кнопка
          if (row) {
            row.remove(); // Удаляем строку
          }
        });
      });
    }
  });

  // Функция для экспорта данных в несколько форматов
function exportData() {
    // Функция экспорта в CSV
    function exportToCSV(data) {
        const bom = '\uFEFF'; // BOM для UTF-8
        const headers = ['Имя', 'Класс', 'Информатика', 'Физика', 'Математика', 'Литература', 'Музыка'];
      
        let csvContent = bom + headers.map(h => `"${h}"`).join(';') + '\n'; // Заголовки с точкой с запятой
      
        data.forEach(row => {
          const rowContent = row.map(cell => `"${cell}"`).join(';'); // Разделяем ячейки точкой с запятой
          csvContent += rowContent + '\n';
        });
      
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'table_data.csv';
        link.click();
      }
  
    // Функция экспорта в TXT
    function exportToTXT(data) {
      const headers = ['Имя', 'Класс', 'Информатика', 'Физика', 'Математика', 'Литература', 'Музыка'];
  
      let txtContent = headers.join(';') + '\n'; // Заголовки с разделителем точка с запятой
      data.forEach((row) => {
        const rowContent = row.join(';'); // Преобразуем строки в TXT-формат
        txtContent += rowContent + '\n'; // Добавляем в TXT
      });
  
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' }); // Создаем Blob для TXT
      const link = document.createElement('a'); // Создаем элемент <a> для скачивания
      link.href = URL.createObjectURL(blob);
      link.download = 'table_data.txt'; // Имя файла
      link.click(); // Инициируем скачивание
    }
  
    // Функция экспорта в XLSX
    function exportToXLSX(data) {
      const workbook = XLSX.utils.book_new(); // Новый рабочий лист
      const headers = ['Имя', 'Класс', 'Информатика', 'Физика', 'Математика', 'Литература', 'Музыка'];
      const worksheetData = [headers].concat(data); // Добавляем заголовки
  
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData); // Создаем лист Excel из данных
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); // Добавляем лист в книгу
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }); // Записываем в массив байтов
  
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); // Создаем Blob для XLSX
      const link = document.createElement('a'); // Создаем элемент <a> для скачивания
      link.href = URL.createObjectURL(blob);
      link.download = 'table_data.xlsx'; // Имя файла
      link.click(); // Инициируем скачивание
    }
  
    // Функция экспорта в XLS
    function exportToXLS(data) {
      const workbook = XLSX.utils.book_new(); // Новый рабочий лист
      const headers = ['Имя', 'Класс', 'Информатика', 'Физика', 'Математика', 'Литература', 'Музыка'];
      const worksheetData = [headers].concat(data); // Добавляем заголовки
  
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData); // Создаем лист Excel из данных
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); // Добавляем лист в книгу
      const wbout = XLSX.write(workbook, { bookType: 'xls', type: 'array' }); // Записываем в массив байтов
  
      const blob = new Blob([wbout], { type: 'application/vnd.ms-excel' }); // Создаем Blob для XLS
      const link = document.createElement('a'); // Создаем элемент <a> для скачивания
      link.href = URL.createObjectURL(blob); // URL для скачивания
      link.download = 'table_data.xls'; // Имя файла
      link.click(); // Инициируем скачивание
    }
  
    // Получаем данные для экспорта
    const data = getTableData(); // Функция для извлечения данных из таблицы или глобального массива
  
    // Скачиваем данные в четырех форматах
    exportToCSV(data); // Скачиваем в формате CSV
    exportToTXT(data); // Скачиваем в формате TXT
    exportToXLSX(data); // Скачиваем в формате XLSX
    exportToXLS(data); // Скачиваем в формате XLS
  }
  
  // Примерная реализация функции getTableData
  function getTableData() {
    const data = []; // Инициализируем массив данных
    const table = document.querySelector('#data-preview table'); // Находим таблицу
  
    if (table) {
      const rows = table.querySelectorAll('tbody tr'); // Получаем все строки в таблице
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td'); // Получаем все ячейки в строке
        const rowData = Array.from(cells).slice(0, -1).map(cell => cell.textContent.trim()); // Извлекаем данные, кроме последней колонки (действия)
        data.push(rowData); // Добавляем строку в массив данных
      });
    }
  
    return data; // Возвращаем массив данных
  }
  
  // Привязка функции к кнопке "Скачать данные с сайта"
  document.addEventListener('DOMContentLoaded', () => {
    const downloadButton = document.getElementById('download-data-button'); // Кнопка для скачивания данных
    if (downloadButton) {
      downloadButton.addEventListener('click', exportData); // Привязка функции экспорта данных
    }
  });

// Функция для создания редактируемой таблицы с пустой строкой в конце
function createEditableTable(data) {
    const dataEdit = document.getElementById('data-edit'); // Контейнер, куда добавляем таблицу
    const headers = [
        'Имя', 'Класс', 'Информатика', 'Физика', 'Математика', 'Литература', 'Музыка', 'Действия'
    ]; // Заголовки таблицы

    let html = '<table>';
    html += '<thead><tr>';
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead>';

    html += '<tbody>';
    data.forEach((row, rowIndex) => {
        html += '<tr>';
        row.forEach((cell) => {
            html += `<td contenteditable="false">${cell.trim()}</td>`; // Начальные поля не активны
        });

        html += `<td>
                    <button class="edit-btn" data-row-index="${rowIndex}">Редактировать</button>
                    <button class="save-btn" data-row-index="${rowIndex}" style="display: none;">Сохранить</button>
                    <button class="delete-btn" data-row-index="${rowIndex}">Удалить</button>
                </td>`;
        html += '</tr>';
    });

    // Добавляем пустую строку для ввода нового ученика
    html += '<tr>';
    headers.slice(0, -1).forEach(() => {
        html += `<td contenteditable="true"></td>`;
    });
    html += `<td>
                <button class="add-btn">Добавить</button>
            </td>`;
    html += '</tr>';

    html += '</tbody>';
    html += '</table>';

    dataEdit.innerHTML = html; // Добавляем таблицу
    setupActionButtons(); // Привязываем обработчики к кнопкам "Редактировать", "Сохранить", "Удалить"
    setupAddButton(); // Привязываем обработчик к кнопке "Добавить"
}

// Функция для обработки нажатия кнопки "Добавить"
function setupAddButton() {
    const addButton = document.querySelector('.add-btn'); // Кнопка добавления
    const headers = [
        'Имя', 'Класс', 'Информатика', 'Физика', 'Математика', 'Литература', 'Музыка', 'Действия'
    ];
    addButton.addEventListener('click', function () {
        const row = this.closest('tr'); // Строка с добавлением
        if (row) {
            // Меняем кнопку "Добавить" на "Редактировать", "Сохранить", "Удалить"
            this.style.display = 'none';

            // Делаем поля неактивными
            row.querySelectorAll('td[contenteditable]').forEach(td => {
                td.setAttribute('contenteditable', 'false');
            });

            // Добавляем стандартные кнопки для действий
            const actions = `
                <button class="edit-btn">Редактировать</button>
                <button class="save-btn" style="display: none;">Сохранить</button>
                <button class="delete-btn">Удалить</button>
            `;

            row.querySelector('td:last-child').innerHTML = actions; // Заменяем столбец действий на новые кнопки
            
            setupActionButtons(); // Устанавливаем обработчики для новых кнопок
            
            // Добавляем новую пустую строку для следующего добавления
            const tableBody = row.closest('tbody');
            const newRow = document.createElement('tr');
            headers.slice(0, -1).forEach(() => {
                newRow.innerHTML += `<td contenteditable="true"></td>`;
            });

            newRow.innerHTML += `<td><button class="add-btn">Добавить</button></td>`;
            tableBody.appendChild(newRow); // Добавляем новую строку

            setupAddButton(); // Привязываем обработчик к новой кнопке "Добавить"
        }
    });
}

// Функция установки обработчиков для "Редактировать", "Сохранить", "Удалить"
function setupActionButtons() {
    // Кнопка "Удалить"
    document.querySelectorAll('.delete-btn').forEach((button) => {
        button.addEventListener('click', function () {
            const row = this.closest('tr');
            if (row) {
                row.remove(); // Удаляем строку
            }
        });
    });

    // Кнопка "Редактировать"
    document.querySelectorAll('.edit-btn').forEach((button) => {
        button.addEventListener('click', function () {
            const row = this.closest('tr');
            if (row) {
                const editableCells = row.querySelectorAll('td:not(:last-child)'); // Поля для редактирования
                editableCells.forEach(td => {
                    td.setAttribute('contenteditable', 'true'); // Делаем поля активными
                });

                this.style.display = 'none'; // Скрываем кнопку "Редактировать"
                row.querySelector('.save-btn').style.display = 'inline'; // Показываем кнопку "Сохранить"
            }
        });
    });

    // Кнопка "Сохранить"
    document.querySelectorAll('.save-btn').forEach((button) => {
        button.addEventListener('click', function () {
            const row = this.closest('tr');
            if (row) {
                const editableCells = row.querySelectorAll('td:not(:last-child)'); // Поля для сохранения
                editableCells.forEach(td => {
                    td.removeAttribute('contenteditable'); // Делаем поля неактивными
                });

                this.style.display = 'none'; // Скрываем кнопку "Сохранить"
                row.querySelector('.edit-btn').style.display = 'inline'; // Показываем кнопку "Редактировать"
            }
        });
    });
}

// Функция для вычисления среднего значения
function calculateAverage(grades) {
    const sum = grades.reduce((a, b) => a + b, 0);
    return (sum / grades.length) || 0;
  }
  
  // Функция для вычисления медианы
  function calculateMedian(grades) {
    const sortedGrades = [...grades].sort((a, b) => a - b);
    const mid = Math.floor(sortedGrades.length / 2);
    return sortedGrades.length % 2 !== 0
      ? sortedGrades[mid]
      : (sortedGrades[mid - 1] + sortedGrades[mid]) / 2;
  }
  
  // Функция для подсчета учеников с каждой оценкой
  function countGrades(grades) {
    const counts = { '2': 0, '3': 0, '4': 0, '5': 0 };
    grades.forEach(grade => {
      counts[grade] = (counts[grade] || 0) + 1;
    });
    return counts;
  }
  

// Функция для извлечения данных из 'data-edit' и создания таблицы статистики
function createStatsTable() {
    // Ищем необходимые элементы
    const dataEdit = document.getElementById("data-edit");
    const statsTableContainer = document.getElementById("stats-table");

    if (!dataEdit || !statsTableContainer) {
        console.error("Не удалось найти 'data-edit' или 'stats-table'");
        return;
    }

    // Получаем таблицу из 'data-edit'
    const table = dataEdit.querySelector("table");
  
    if (!table) {
      console.error("Не удалось найти таблицу в 'data-edit'");
      return;
    }

    // Извлекаем данные, исключая пустые строки
    const data = [];
    const rows = table.querySelectorAll("tbody tr");
  
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td:not(:last-child)"); // Извлекаем все ячейки, кроме действий
      const rowData = Array.from(cells).map((cell) => cell.textContent.trim()); // Получаем текст из ячеек

      // Проверяем, что строка не пустая (например, имеет значение в первом или втором столбце)
      if (rowData.some((cell) => cell)) {
          data.push(rowData); // Добавляем непустые строки
      }
    });

    if (data.length === 0) {
      console.warn("Нет данных для обработки в 'data-edit'");
      return;
    }

    // Группируем данные по классу и предмету
    const classSubjectStats = {};

    data.forEach((row) => {
      const [name, class_, informatics, physics, math, literature, music] = row;

      // Убедитесь, что класс и хотя бы один предмет имеют значение
      if (!class_ || ![informatics, physics, math, literature, music].some(val => val)) {
          return; // Пропускаем строки, если они пустые или без значимых данных
      }

      const subjects = {
        "Информатика": parseInt(informatics, 10),
        "Физика": parseInt(physics, 10),
        "Математика": parseInt(math, 10),
        "Литература": parseInt(literature, 10),
        "Музыка": parseInt(music, 10),
      };

      if (!classSubjectStats[class_]) {
        classSubjectStats[class_] = {}; // Инициализируем объект для класса
      }

      for (const subject in subjects) {
        const grade = subjects[subject];
        if (!isNaN(grade)) {
          if (!classSubjectStats[class_][subject]) {
            classSubjectStats[class_][subject] = [];
          }
          classSubjectStats[class_][subject].push(grade); // Добавляем значение
        }
      }
    });

    // Создаем таблицу статистики
    let html = "<table>";
    html += `
      <thead>
        <tr>
          <th>Класс</th>
          <th>Предмет</th>
          <th>Средняя оценка</th>
          <th>Медиана</th>
          <th>Количество 5</th>
          <th>Количество 4</th>
          <th>Количество 3</th>
          <th>Количество 2</th>
          <th>Процент 5</th>
          <th>Процент 4</th>
          <th>Процент 3</th>
          <th>Процент 2</th>
        </tr>
      </thead>
      <tbody>
    `;

    for (const class_ in classSubjectStats) {
      for (const subject in classSubjectStats[class_]) {
        const grades = classSubjectStats[class_][subject];

        const average = calculateAverage(grades).toFixed(2);
        const median = calculateMedian(grades).toFixed(2);
        const gradeCounts = countGrades(grades);

        const totalGrades = grades.length;
        const percent5 = ((gradeCounts["5"] / totalGrades) * 100).toFixed(2);
        const percent4 = ((gradeCounts["4"] / totalGrades) * 100).toFixed(2);
        const percent3 = ((gradeCounts["3"] / totalGrades) * 100).toFixed(2);
        const percent2 = ((gradeCounts["2"] / totalGrades) * 100).toFixed(2);

        html += `
          <tr>
            <td>${class_}</td>
            <td>${subject}</td>
            <td>${average}</td>
            <td>${median}</td>
            <td>${gradeCounts["5"]}</td>
            <td>${gradeCounts["4"]}</td>
            <td>${gradeCounts["3"]}</td>
            <td>${gradeCounts["2"]}</td>
            <td>${percent5}%</td>
            <td>${percent4}%</td>
            <td>${percent3}%</td>
            <td>${percent2}%</td>
          </tr>
        `;
      }
    }

    html += "</tbody>";
    html += "</table>";

    statsTableContainer.innerHTML = html; // Добавляем таблицу в контейнер
  }

  function createStudentStatsTable() {
    const dataEdit = document.getElementById("data-edit");
    const studentStatsContainer = document.getElementById("student-stats-table");
  
    if (!dataEdit || !studentStatsContainer) {
      console.error("Не удалось найти 'data-edit' или 'student-stats-table'");
      return;
    }
  
    // Получаем таблицу из 'data-edit'
    const table = dataEdit.querySelector("table");
    
    if (!table) {
      console.error("Не удалось найти таблицу в 'data-edit'");
      return;
    }
  
    // Извлекаем данные, исключая пустые строки
    const data = [];
    const rows = table.querySelectorAll("tbody tr");
    
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td:not(:last-child)"); // Извлекаем все ячейки, кроме действий
      const rowData = Array.from(cells).map((cell) => cell.textContent.trim()); // Получаем текст из ячеек
  
      // Проверяем, что строка содержит как минимум имя ученика
      if (rowData.some((cell) => cell)) {
        data.push(rowData); // Добавляем непустые строки
      }
    });
  
    if (data.length === 0) {
      console.warn("Нет данных для обработки в 'data-edit'");
      return;
    }
  
    // Группируем данные по ученику и предмету
    const studentSubjectStats = {};
  
    data.forEach((row) => {
      const [name, class_, informatics, physics, math, literature, music] = row;
  
      const subjects = {
        "Информатика": parseInt(informatics, 10),
        "Физика": parseInt(physics, 10),
        "Математика": parseInt(math, 10),
        "Литература": parseInt(literature, 10),
        "Музыка": parseInt(music, 10),
      };
  
      if (!studentSubjectStats[name]) {
        studentSubjectStats[name] = {}; // Инициализируем объект для ученика
      }
  
      for (const subject in subjects) {
        const grade = subjects[subject];
        if (!isNaN(grade)) {
          if (!studentSubjectStats[name][subject]) {
            studentSubjectStats[name][subject] = [];
          }
          studentSubjectStats[name][subject].push(grade); // Добавляем значение
        }
      }
    });
  
    // Создаем таблицу статистики по ученикам и предметам
    let html = "<table>";
    html += `
      <thead>
        <tr>
          <th>Имя ученика</th>
          <th>Предмет</th>
          <th>Средняя оценка</th>
          <th>Медиана</th>
          <th>Количество 5</th>
          <th>Количество 4</th>
          <th>Количество 3</th>
          <th>Количество 2</th>
          <th>Процент 5</th>
          <th>Процент 4</th>
          <th>Процент 3</th>
          <th>Процент 2</th>
        </tr>
      </thead>
      <tbody>
    `;
  
    for (const name in studentSubjectStats) {
      for (const subject in studentSubjectStats[name]) {
        const grades = studentSubjectStats[name][subject];
  
        const average = calculateAverage(grades).toFixed(2);
        const median = calculateMedian(grades).toFixed(2);
        const gradeCounts = countGrades(grades);
  
        const totalGrades = grades.length;
        const percent5 = ((gradeCounts["5"] / totalGrades) * 100).toFixed(2);
        const percent4 = ((gradeCounts["4"] / totalGrades) * 100).toFixed(2);
        const percent3 = ((gradeCounts["3"] / totalGrades) * 100).toFixed(2);
        const percent2 = ((gradeCounts["2"] / totalGrades) * 100).toFixed(2);
  
        html += `
          <tr>
            <td>${name}</td>
            <td>${subject}</td>
            <td>${average}</td>
            <td>${median}</td>
            <td>${gradeCounts["5"]}</td>
            <td>${gradeCounts["4"]}</td>
            <td>${gradeCounts["3"]}</td>
            <td>${gradeCounts["2"]}</td>
            <td>${percent5}%</td>
            <td>${percent4}%</td>
            <td>${percent3}%</td>
            <td>${percent2}%</td>
          </tr>
        `;
      }
    }
  
    html += "</tbody>";
    html += "</table>";
  
    // Добавляем таблицу в контейнер
    studentStatsContainer.innerHTML = html;
  }
  
// Функция для извлечения данных из 'stats-table' и 'student-stats-table'
function getChartData() {
    const classStatsTable = document.getElementById("stats-table");
    const studentStatsTable = document.getElementById("student-stats-table");
  
    const classStatsData = {};
    const studentStatsData = {};
  
    // Извлекаем данные из таблицы по классам
    if (classStatsTable) {
      const rows = classStatsTable.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        const class_ = cells[0].textContent.trim();
        const subject = cells[1].textContent.trim();
        const average = parseFloat(cells[2].textContent.trim());
  
        if (!classStatsData[subject]) {
          classStatsData[subject] = {};
        }
  
        classStatsData[subject][class_] = average; // Сохраняем среднюю оценку
      });
    }
  
    // Извлекаем данные из таблицы по ученикам
    if (studentStatsTable) {
      const rows = studentStatsTable.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        const name = cells[0].textContent.trim();
        const subject = cells[1].textContent.trim();
        const average = parseFloat(cells[2].textContent.trim());
  
        if (!studentStatsData[subject]) {
          studentStatsData[subject] = {};
        }
  
        studentStatsData[subject][name] = average; // Сохраняем среднюю оценку
      });
    }
  
    return { classStatsData, studentStatsData };
  }
  
  function createCharts() {
    const { classStatsData, studentStatsData } = getChartData();
  
    // Проверка, есть ли данные для построения графиков
    if (!classStatsData || !studentStatsData) {
      console.error("Не удалось получить данные для графиков");
      return;
    }
  
    const classGraphCtx = document.getElementById("classGraphCanvas").getContext("2d");
    const studentGraphCtx = document.getElementById("studentGraphCanvas").getContext("2d");
  
    // Убедимся, что графики не создаются повторно
    if (classGraphCtx.chart) {
      classGraphCtx.chart.destroy(); // Уничтожаем существующий график
    }
    if (studentGraphCtx.chart) {
      studentGraphCtx.chart.destroy(); // Уничтожаем существующий график
    }
  
    // Определяем палитру фиксированных цветов
    const colorPalette = [
      "rgba(54, 162, 235, 0.5)", // Синий
      "rgba(255, 99, 132, 0.5)",  // Красный
      "rgba(255, 206, 86, 0.5)",  // Желтый
      "rgba(75, 192, 192, 0.5)",  // Бирюзовый
      "rgba(153, 102, 255, 0.5)", // Фиолетовый
    ];
  
    // Создаем график для статистики по классам
    const classDatasets = [];
    const classLabels = [];
  
    let colorIndex = 0; // Используем индикатор для выбора цвета
  
    for (const subject in classStatsData) {
      const classData = classStatsData[subject];
      if (Object.keys(classData).length > 0) {
        classDatasets.push({
          label: subject,
          data: Object.values(classData),
          backgroundColor: colorPalette[colorIndex % colorPalette.length], // Фиксированный цвет
        });
  
        // Заполняем метки классами, если они не существуют
        if (classLabels.length === 0) {
          classLabels.push(...Object.keys(classData));
        }
  
        colorIndex++; // Увеличиваем индекс для следующего цвета
      }
    }
  
    if (classDatasets.length > 0) {
      classGraphCtx.chart = new Chart(classGraphCtx, {
        type: "bar",
        data: {
          labels: classLabels, // Названия классов
          datasets: classDatasets,
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: "Статистика по классам",
            },
          },
        },
      });
    }
  
    // Создаем график для статистики по ученикам
    const studentDatasets = [];
    const studentLabels = [];
  
    colorIndex = 0; // Сбрасываем индекс для нового графика
  
    for (const subject in studentStatsData) {
      const studentData = studentStatsData[subject];
      if (Object.keys(studentData).length > 0) {
        studentDatasets.push({
          label: subject,
          data: Object.values(studentData),
          backgroundColor: colorPalette[colorIndex % colorPalette.length], // Фиксированный цвет
        });
  
        // Заполняем метки именами учеников, если они не существуют
        if (studentLabels.length === 0) {
          studentLabels.push(...Object.keys(studentData));
        }
  
        colorIndex++; // Увеличиваем индекс
      }
    }
  
    if (studentDatasets.length > 0) {
      studentGraphCtx.chart = new Chart(studentGraphCtx, {
        type: "bar",
        data: {
          labels: studentLabels, // Имена учеников
          datasets: studentDatasets,
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: "Статистика по ученикам",
            },
          },
        },
      });
    }
  }
  
  // Вызов функции для построения графиков при загрузке вкладки с графиками
  document.addEventListener("DOMContentLoaded", createCharts);
  