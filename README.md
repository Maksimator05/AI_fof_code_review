# AI_fof_code_review

2. **Запуск Docker-Compose**
   
Создайте файл `.env` в корне проекта со следующим содержимым:
```env
SECRET_KEY=your-secret-key
IP=127.0.0.1

# Настройки базы данных
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=postgres

# Настройки для LM Studio (локально запущенного)
LM_STUDIO_URL=http://host.docker.internal:1234
LM_STUDIO_ENABLED=true

# Настройки приложения
API_URL=http://localhost:8000
ML_SERVICE_URL=http://localhost:8001
```