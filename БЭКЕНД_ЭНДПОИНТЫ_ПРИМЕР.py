# Пример реализации эндпоинтов для Mini App «Путь к Себе» (aiohttp + SQLite)
# Добавь в файл, где уже есть app = web.Application() и роуты /mini-app/init.
#
# Важно: Mini App отправляет поля в camelCase: testId, testTitle, dimensions, completedAt.
# Ниже пример принимает и snake_case (test_id, test_title, ...). На бэкенде можно
# принимать оба варианта: data.get('testId') or data.get('test_id') и т.д.

from aiohttp import web
import json
from datetime import datetime
import aiosqlite

# Замени на твои импорты: check_token, add_cors_headers, DB_PATH
# from your_bot.utils import check_app_save_token, add_cors_headers

DB_PATH = 'bot.db'

# --- Таблица (добавь в init_db или миграцию) ---
# async def init_db():
#     async with aiosqlite.connect(DB_PATH) as db:
#         await db.execute('''
#             CREATE TABLE IF NOT EXISTS test_results (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 user_id INTEGER NOT NULL,
#                 test_id TEXT NOT NULL,
#                 test_title TEXT NOT NULL,
#                 answers_json TEXT NOT NULL,
#                 dimension_scores_json TEXT,
#                 completed_at TEXT NOT NULL,
#                 FOREIGN KEY (user_id) REFERENCES users(id)
#             )
#         ''')
#         await db.commit()


async def get_user_id_from_token(token: str):
    """Твоя функция: SELECT user_id FROM app_save_tokens WHERE token = ? AND expires_at > datetime('now')."""
    # Пример:
    # async with aiosqlite.connect(DB_PATH) as db:
    #     cursor = await db.execute('SELECT user_id FROM app_save_tokens WHERE token = ?', (token,))
    #     row = await cursor.fetchone()
    #     return row[0] if row else None
    return None


def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'https://path-to-self-miniapp-ozharov164-9998s-projects.vercel.app'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'


async def save_test_result(request):
    data = await request.json()
    token = data.get('token')
    if not token:
        return web.json_response({'error': 'Token required'}, status=401)

    user_id = await get_user_id_from_token(token)
    if not user_id:
        return web.json_response({'error': 'Invalid token'}, status=401)

    # Mini App шлёт: testId, testTitle, answers, dimensions?, completedAt
    test_id = data.get('testId') or data.get('test_id')
    test_title = data.get('testTitle') or data.get('test_title')
    answers = data.get('answers', [])
    dimension_scores = data.get('dimensions') or data.get('dimension_scores', {})
    completed_at = data.get('completedAt') or data.get('completed_at') or datetime.utcnow().isoformat() + 'Z'

    if not test_id or not test_title or not isinstance(answers, list):
        return web.json_response({'error': 'Invalid data'}, status=400)

    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute('''
            INSERT INTO test_results (user_id, test_id, test_title, answers_json, dimension_scores_json, completed_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, test_id, test_title, json.dumps(answers), json.dumps(dimension_scores), completed_at))
        await db.commit()
        result_id = str(cursor.lastrowid)

    # Mini App ожидает ответ: { "id": "..." }
    response = web.json_response({'id': result_id}, status=200)
    add_cors_headers(response)
    return response


async def test_history(request):
    data = await request.json() if request.body_exists else {}
    token = data.get('token')
    if not token:
        return web.json_response({'error': 'Token required'}, status=401)

    user_id = await get_user_id_from_token(token)
    if not user_id:
        return web.json_response({'error': 'Invalid token'}, status=401)

    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute('''
            SELECT id, test_id, test_title, completed_at
            FROM test_results WHERE user_id = ? ORDER BY completed_at DESC
        ''', (user_id,))
        rows = await cursor.fetchall()

    # Mini App ожидает: items[] с id, testId, testTitle, completedAt
    items = [
        {'id': str(row[0]), 'testId': row[1], 'testTitle': row[2], 'completedAt': row[3]}
        for row in rows
    ]

    response = web.json_response({'items': items}, status=200)
    add_cors_headers(response)
    return response


async def get_test_result(request):
    result_id = request.match_info['result_id']
    token = request.query.get('token')
    if not token:
        return web.json_response({'error': 'Token required'}, status=401)

    user_id = await get_user_id_from_token(token)
    if not user_id:
        return web.json_response({'error': 'Invalid token'}, status=401)

    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute('''
            SELECT id, test_id, test_title, answers_json, dimension_scores_json, completed_at
            FROM test_results WHERE id = ? AND user_id = ?
        ''', (result_id, user_id))
        row = await cursor.fetchone()

    if not row:
        return web.json_response({'error': 'Result not found'}, status=404)

    # Mini App ожидает: id, testId, testTitle, answers, dimensions?, completedAt
    data = {
        'id': str(row[0]),
        'testId': row[1],
        'testTitle': row[2],
        'answers': json.loads(row[3]),
        'dimensions': json.loads(row[4]) if row[4] else {},
        'completedAt': row[5]
    }

    response = web.json_response(data, status=200)
    add_cors_headers(response)
    return response


# Регистрация роутов (добавь в setup или main):
# app.router.add_post('/mini-app/save-test-result', save_test_result)
# app.router.add_post('/mini-app/test-history', test_history)
# app.router.add_get('/mini-app/test-result/{result_id}', get_test_result)
