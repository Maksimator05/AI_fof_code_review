from typing import Dict, List, Union

# Тестовый вариант для изображения рабочей базы данных
class Database:
    def __init__(self):
        self._users: List[Dict[str, Union[int, str, bool]]] = [
            {
                'id': 1,
                'nickname': 'Ivan Ivanov',
                'email': 'i.i.ivanov@mail.com',
            }
        ]

        self._id = len(self._users)

    def get_user_by_email(self, email: str):
        # TODO
        return None

    def get_user_by_nickname(self, nickname: str):
        # TODO
        return None

db = Database()