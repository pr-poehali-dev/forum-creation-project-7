'''
Business: User registration and authentication API for forum
Args: event - dict with httpMethod, body (JSON with username, email, password)
      context - object with request_id attribute
Returns: HTTP response with user data or error
'''
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${pwd_hash.hex()}"

def verify_password(password: str, password_hash: str) -> bool:
    salt, pwd_hash = password_hash.split('$')
    new_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return new_hash.hex() == pwd_hash

def create_session(user_id: int) -> str:
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=30)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
        (user_id, session_token, expires_at)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return session_token

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', 'register')
        
        if action == 'register':
            username = body_data.get('username', '').strip()
            email = body_data.get('email', '').strip().lower()
            password = body_data.get('password', '')
            
            if not username or not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Все поля обязательны для заполнения'})
                }
            
            if len(username) < 3 or len(username) > 50:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Имя пользователя должно быть от 3 до 50 символов'})
                }
            
            if len(password) < 6:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пароль должен быть минимум 6 символов'})
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
            existing_user = cur.fetchone()
            
            if existing_user:
                cur.close()
                conn.close()
                return {
                    'statusCode': 409,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким именем или email уже существует'})
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                "INSERT INTO users (username, email, password_hash, status) VALUES (%s, %s, %s, %s) RETURNING id, username, email, avatar_url, created_at",
                (username, email, password_hash, 'online')
            )
            
            user = cur.fetchone()
            conn.commit()
            
            session_token = create_session(user['id'])
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'username': user['username'],
                        'email': user['email'],
                        'avatar_url': user['avatar_url'],
                        'created_at': user['created_at'].isoformat() if user['created_at'] else None
                    },
                    'session_token': session_token,
                    'message': 'Регистрация успешна!'
                })
            }
        
        elif action == 'login':
            username_or_email = body_data.get('username', '').strip()
            password = body_data.get('password', '')
            
            if not username_or_email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Введите имя пользователя/email и пароль'})
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute(
                "SELECT id, username, email, password_hash, avatar_url FROM users WHERE username = %s OR email = %s",
                (username_or_email, username_or_email.lower())
            )
            
            user = cur.fetchone()
            
            if not user or not verify_password(password, user['password_hash']):
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверное имя пользователя или пароль'})
                }
            
            cur.execute("UPDATE users SET status = %s, last_seen = %s WHERE id = %s", ('online', datetime.now(), user['id']))
            conn.commit()
            
            session_token = create_session(user['id'])
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'username': user['username'],
                        'email': user['email'],
                        'avatar_url': user['avatar_url']
                    },
                    'session_token': session_token,
                    'message': 'Вход выполнен успешно!'
                })
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Метод не поддерживается'})
    }
