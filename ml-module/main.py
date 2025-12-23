import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests

app = FastAPI()


class CodeRequest(BaseModel):
    code: str


class ModelResponse(BaseModel):
    analysis: str
    status: str


@app.get("/Проверка работы модели")
def check():
    try:
        response = requests.get("http://26.203.117.181:1234/v1/models", timeout=10)
        return {"status": "healthy", "message": "Сервис анализа кода работает"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ошибка подключения к модели")


@app.post("/Отправить код")
def send_code(request: CodeRequest):
    payload = {
        "model": "qwen2.5-coder-7b-instruct",
        "messages": [
            {
                "role": "system",
                "content": "Ты - опытный программист. Проанализируй предоставленный код, найди потенциальные ошибки, предложи улучшения и дай рекомендации."
            },
            {
                "role": "user",
                "content": f"Проанализируй этот код:\n```python\n{request.code}\n```"
            }
        ],
        "max_tokens": -1,
        "temperature": 0.7
    }

    try:
        response = requests.post(
            "http://26.203.117.181:1234/v1/chat/completions",
            json=payload,
            timeout=240
        )
        data = response.json()
        result = data["choices"][0]["message"]["content"]

        return ModelResponse(
            analysis=result,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Отсутствует подключение к модели")


if __name__ == '__main__':
    uvicorn.run("main:app", reload=True)