# AI Code Review API - Документация

## Обзор

Бэкенд-сервис с аутентификацией пользователей и интеграцией с ML-сервисом для анализа исходного кода.


## Запуск


### Предварительные требования

- Python 3.12

### Установка и запуск (локально)

1. **Клонирование и настройка окружения**
```bash
# Клонирование репозитория
git clone <repository-url>
cd backend

# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # Для Windows: venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt
```

2. **Настройка**
   
Создайте файл `.env` в корне проекта со следующим содержимым:
```env
SECRET_KEY=your-secret-key
```

4. **Запуск сервера**
```bash
python -m backend.app.main
```

Сервер будет доступен по адресу: `http://127.0.0.1:8080`

### Запуск через Docker

1. **Сборка образа**
```bash
docker build -t ai-code-review-api .
```

2. **Запуск контейнера**
```bash
docker run -d \
  -p 8080:8080 \
  --name code-review-api \
  -e SECRET_KEY=your-secret-key \
  ai-code-review-api
```

## API Endpoints

### Аутентификация

| Метод | Эндпоинт | Описание                                                                        | Требуется токен |
|-------|----------|---------------------------------------------------------------------------------|----------------|
| POST | `/register` | Регистрация нового пользователя                                                 | ❌ |
| POST | `/login` | Вход в систему (возвращает access_token и refresh_token но в http only coockie) | ❌ |
| POST | `/refresh` | Обновление access token через refresh token                                     | ❌ (требуется refresh token в cookie) |
| POST | `/logout` | Выход из системы                                                                | ✅ |
| GET | `/users/me` | Получение информации о текущем пользователе                                     | ✅ |

### Работа с кодом и диалогами

| Метод | Эндпоинт | Описание                                               | Требуется токен |
|-------|----------|--------------------------------------------------------|----------------|
| POST | `/message` | Отправка кода для анализа, создание/продолжение диалога | ✅ |
| POST | `/load_file` | Загрузка файла с кодом и отправка на анализ        | ✅ |

### Проверка состояния

| Метод | Эндпоинт | Описание                                  |
|-------|----------|-------------------------------------------|
| GET | `/health-api` | Проверка работы API                       |
| GET | `/health-ml` | Проверка доступности ML-сервиса через API |

## Примеры использования API

### Регистрация пользователя
```bash
curl -X POST http://127.0.0.1:8080/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Авторизация
```bash
curl -X POST http://127.0.0.1:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepassword123"
  }'
```

### Анализ кода
```bash
curl -X POST http://127.0.0.1:8080/message \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "def calculate_sum(a, b):\n    return a + b",
    "language": "python"
  }'
```

### Загрузка файла с кодом
```bash
curl -X POST http://127.0.0.1:8080/load_file \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/your/code.py"
```

## 🗂️ Структура проекта

```
AI_fof_code_review/
├── backend/
    ├── app/
    │   ├── auth/           # Логика аутентификации и JWT
    │   ├── clients/        # Клиенты внешних сервисов (ML)
    │   ├── db/            # Настройка базы данных
    │   ├── models/        # SQLAlchemy модели
    │   ├── routers/       # Маршруты API (endpoints.py)
    │   ├── schemas/       # Pydantic схемы для валидации
    │   ├── __init__.py
    │   └── main.py        # Точка входа приложения
    ├── tests/             # Тесты
    ├── Dockerfile         # Конфигурация Docker
    ├── README.md          # Эта документация
    └── requirements.txt   # Зависимости Python
```

## ⚙️ Конфигурация

### Переменные окружения

| Переменная | Описание | Значение по умолчанию |
|------------|----------|---------------------|
| `SECRET_KEY` | Секретный ключ для JWT | (обязательно) |

### Поддерживаемые форматы файлов

Сервис поддерживает анализ следующих типов файлов, но
это в основном зависит уже от конечной настройки ml-module:
- `.py` (Python)
- `.js`, `.ts` (JavaScript/TypeScript)
- `.java` (Java)
- `.cpp`, `.c` (C/C++)
- `.cs` (C#)
- `.go` (Go)
- `.rs` (Rust)
- `.html`, `.css` (Веб)
- `.json`, `.xml` (Данные)

## 🐛 Устранение неполадок

### Проблемы с зависимостями
```bash
# Обновление pip
pip install --upgrade pip

# Проверь в какой директории находишься в данный момент
# возможно нужно дополнительно прописать путь перед именем файла зависимостей
pip install -r backend/requirements.txt
```

### Проблемы с Docker
```bash
# Проверка логов контейнера
docker logs code-review-api

# Перезапуск контейнера
docker restart code-review-api
```