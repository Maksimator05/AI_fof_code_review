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

```
для front
# frontend/.env
REACT_APP_API_URL=http://127.0.0.1:8080

для back
SECRET_KEY=dev-secret-key-change-in-production
IP=0.0.0.0
ML_SERVICE_URL=http://ml-service:8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001
```

```
Frontend: http://localhost:3000

Backend API: http://localhost:8080/health-api

ML Service: http://localhost:8080/health-ml
```