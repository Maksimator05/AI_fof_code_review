from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.user import UserInfo
from backend.app.db.database import db

router = APIRouter()


#===========================================================#
#       GET-request, path parameters, get user info
#===========================================================#
@router.get("/userEmail",
            status_code=status.HTTP_200_OK,
            response_model=UserInfo,
            responses={404: {"detail": "User not found"}})
async def get_user_by_email(email: str):
    '''Получение пользователя по email'''
    user = db.get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Пока что предположительно выглядеть информация о пользователях будет так
    return UserInfo(
        id=user['id'],
        nickname=user['nickname'],
        email=user['email']
    )


@router.get("/userNickname",
            status_code=status.HTTP_200_OK,
            response_model=UserInfo,
            responses={404: {"detail": "User not found"}}
)
async def get_user_by_nickname(nickname: str):
    ''' получение пользователя по никнейму, пока что
    будет заложена логика получения сведений о пользователе по двум
    его инфо-полям(никнейм/email), однако
    далее нужно реализовать аутентификацию
    '''
    user = db.get_user_by_nickname(nickname)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return UserInfo(
        id=user['id'],
        nickname=user['nickname'],
        email=user['email']
    )
