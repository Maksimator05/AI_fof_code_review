import requests
import time
import json

API_URL = "http://localhost:1234/v1/chat/completions"


def qwen_request(prompt: str):
    payload = {
        "model": "qwen2.5-coder-7b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": -1,
        "temperature": 0.1
    }

    try:
        r = requests.post(API_URL, json=payload, timeout=240)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print("Ошибка запроса:", e)
        return ""


def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def evaluate_code_dataset(dataset_path="code_data.json"):
    data = load_json(dataset_path)


    total = len(data)
    correct = 0
    wrong = []

    print(f"\n Тестирование кодового датасета ({total} тестов)")
    print("=" * 80)

    for test in data:
        print(f"\n Тест {test['id']}: {test['vulnerability_type']}")
        expected_text = test["expected_issues"]
        print(f"Ожидается: {expected_text}")

        response = qwen_request(
            f"Проанализируй код на ошибки, стиль и безопасность:\n``````"
        )
        print("Ответ модели:", response[:300], "...\n")

        response_lower = response.lower()
        expected_has = test["has_vulnerability"]
        expect_type = test["vulnerability_type"].lower()

        found_vuln = expect_type in response_lower

        ok = (expected_has and found_vuln) or (not expected_has and not found_vuln)

        if ok:
            print("ПРАВИЛЬНО")
            correct += 1
        else:
            print("НЕПРАВИЛЬНО")
            wrong.append(test["id"])

        time.sleep(1)

    print(f"\nИтог: {correct}/{total} ({correct / total * 100:.1f}%)")
    print("Ошибочные тесты:", wrong)
    print("=" * 80)


def evaluate_language_dataset(dataset_path="russian_data.json"):
    data = load_json(dataset_path)
    total = len(data)
    print(f"\nТестирование языкового датасета ({total} примеров)")
    print("=" * 80)

    for entry in data:
        prompt = (
            "Проанализируй код и дай такой же стиль ответа, как в примере ревью.\n\n"
            f"КОД:\n```{entry['code']}```\n\n"
            f"Требуемый стиль ревью:\n{entry['review_comment']}"
        )

        response = qwen_request(prompt)

        print(f"\n🔍 ID {entry['id']}")
        print("Ожидаемый стиль:", entry["category_description"])
        print("Ответ модели:", response[:300], "...\n")
        time.sleep(1)

    print("\nЗавершено.")


if __name__ == "__main__":
    print("Выберите режим:")
    print("1 — Проверить кодовый датасет")
    print("2 — Проверить языковой датасет")
    mode = input("Введите 1 или 2: ")

    if mode == "1":
        evaluate_code_dataset()
    elif mode == "2":
        evaluate_language_dataset()
    else:
        print("Неизвестный режим")
