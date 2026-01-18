import os

import httpx
from typing import Dict, Any
from fastapi import HTTPException, status


ML_SERVICE_URL = os.getenv("ML_SERVICE_URL")
ML_SERVICE_TIMEOUT_SEC = 15
ML_ANALYSIS_TIMEOUT_SEC = 300


class MLClient:
    def __init__(self):
        self.base_url = ML_SERVICE_URL
        self.timeout = ML_SERVICE_TIMEOUT_SEC

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/Проверка работы модели",
                    timeout=self.timeout
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=e.response.json()
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"ML service unavailable: {str(e)}"
            )

    async def analyze_code(self, code: str) -> Dict[str, Any]:
        payload = {"code": code}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/Отправить код",
                    json=payload,
                    timeout=ML_ANALYSIS_TIMEOUT_SEC
                )
                response.raise_for_status()
                return response.json()
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="ML service analysis timeout"
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"ML service error: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to connect to ML service: {str(e)}"
            )


ml_client = MLClient()