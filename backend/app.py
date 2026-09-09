#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
糖尿病预治智能助手 - 后端API
基于 Flask + SQLite，提供用户管理、健康数据管理等增删改查功能
"""

from flask import Flask, request, jsonify, g
from flask_cors import CORS
import sqlite3
import os
import hashlib
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# 数据库路径
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'diabetes.db')

# ==================== 数据库操作 ====================

def get_db():
    """获取数据库连接"""
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(error):
    """关闭数据库连接"""
    if 'db' in g:
        g.db.close()

def init_db():
    """初始化数据库表"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            real_name TEXT,
            age INTEGER,
            gender TEXT,
            role TEXT DEFAULT 'user',
            status TEXT DEFAULT 'active',
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    
    # 健康数据表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS health_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            fasting_blood_sugar REAL,
            postprandial_blood_sugar REAL,
            weight REAL,
            exercise_minutes INTEGER,
            diet_status TEXT,
            notes TEXT,
            record_date TEXT,
            created_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # 用药计划表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            dosage TEXT,
            frequency TEXT,
            reminder_times TEXT,
            notes TEXT,
            status TEXT DEFAULT 'active',
            created_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # 风险评估表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS risk_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            age INTEGER,
            gender TEXT,
            bmi REAL,
            score INTEGER,
            level TEXT,
            advice TEXT,
            created_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # 插入默认管理员账户
    cursor.execute('SELECT * FROM users WHERE username = ?', ('admin',))
    if not cursor.fetchone():
        admin_password = hashlib.md5('admin123'.encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (username, password, email, real_name, role, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('admin', admin_password, 'admin@diabetes.com', '系统管理员', 'admin', 'active', 
              datetime.now().strftime('%Y-%m-%d %H:%M:%S'), datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        print('默认管理员账户已创建: admin / admin123')
    
    # 插入测试用户
    cursor.execute('SELECT * FROM users WHERE username = ?', ('testuser',))
    if not cursor.fetchone():
        user_password = hashlib.md5('123456'.encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (username, password, email, real_name, age, gender, role, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('testuser', user_password, 'test@example.com', '张三', 45, '男', 'user', 'active',
              datetime.now().strftime('%Y-%m-%d %H:%M:%S'), datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        print('测试用户已创建: testuser / 123456')
    
    conn.commit()
    conn.close()
    print(f'数据库初始化完成: {DB_PATH}')

# ==================== 用户管理 API ====================

@app.route('/api/users', methods=['GET'])
def get_users():
    """获取所有用户（支持分页和搜索）"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)
    
    db = get_db()
    
    # 构建查询
    query = 'SELECT * FROM users WHERE 1=1'
    params = []
    
    if search:
        query += ' AND (username LIKE ? OR real_name LIKE ? OR email LIKE ?)'
        params.extend([f'%{search}%', f'%{search}%', f'%{search}%'])
    
    # 总数
    count_query = query.replace('SELECT *', 'SELECT COUNT(*)')
    total = db.execute(count_query, params).fetchone()[0]
    
    # 分页
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?'
    params.extend([per_page, (page - 1) * per_page])
    
    users = db.execute(query, params).fetchall()
    
    return jsonify({
        'code': 0,
        'message': 'success',
        'data': {
            'list': [dict(u) for u in users],
            'total': total,
            'page': page,
            'per_page': per_page
        }
    })

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """获取单个用户详情"""
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    
    if not user:
        return jsonify({'code': 404, 'message': '用户不存在'}), 404
    
    return jsonify({'code': 0, 'message': 'success', 'data': dict(user)})

@app.route('/api/users', methods=['POST'])
def create_user():
    """创建用户"""
    data = request.get_json()
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'code': 400, 'message': '用户名和密码不能为空'}), 400
    
    db = get_db()
    
    # 检查用户名是否存在
    existing = db.execute('SELECT id FROM users WHERE username = ?', (data['username'],)).fetchone()
    if existing:
        return jsonify({'code': 400, 'message': '用户名已存在'}), 400
    
    password_hash = hashlib.md5(data['password'].encode()).hexdigest()
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    db.execute('''
        INSERT INTO users (username, password, email, phone, real_name, age, gender, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['username'], password_hash,
        data.get('email', ''), data.get('phone', ''),
        data.get('real_name', ''), data.get('age'),
        data.get('gender', ''), data.get('role', 'user'),
        data.get('status', 'active'), now, now
    ))
    
    db.commit()
    user_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]
    
    return jsonify({'code': 0, 'message': '用户创建成功', 'data': {'id': user_id}})

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """更新用户信息"""
    data = request.get_json()
    db = get_db()
    
    user = db.execute('SELECT id FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        return jsonify({'code': 404, 'message': '用户不存在'}), 404
    
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # 构建更新字段
    fields = []
    params = []
    
    if 'email' in data:
        fields.append('email = ?')
        params.append(data['email'])
    if 'phone' in data:
        fields.append('phone = ?')
        params.append(data['phone'])
    if 'real_name' in data:
        fields.append('real_name = ?')
        params.append(data['real_name'])
    if 'age' in data:
        fields.append('age = ?')
        params.append(data['age'])
    if 'gender' in data:
        fields.append('gender = ?')
        params.append(data['gender'])
    if 'role' in data:
        fields.append('role = ?')
        params.append(data['role'])
    if 'status' in data:
        fields.append('status = ?')
        params.append(data['status'])
    if 'password' in data and data['password']:
        fields.append('password = ?')
        params.append(hashlib.md5(data['password'].encode()).hexdigest())
    
    fields.append('updated_at = ?')
    params.append(now)
    params.append(user_id)
    
    if fields:
        db.execute(f'UPDATE users SET {", ".join(fields)} WHERE id = ?', params)
        db.commit()
    
    return jsonify({'code': 0, 'message': '用户更新成功'})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """删除用户"""
    db = get_db()
    
    user = db.execute('SELECT id, username FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        return jsonify({'code': 404, 'message': '用户不存在'}), 404
    
    if user['username'] == 'admin':
        return jsonify({'code': 400, 'message': '不能删除管理员账户'}), 400
    
    db.execute('DELETE FROM users WHERE id = ?', (user_id,))
    db.commit()
    
    return jsonify({'code': 0, 'message': '用户删除成功'})

# ==================== 登录 API ====================

@app.route('/api/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'code': 400, 'message': '用户名和密码不能为空'}), 400
    
    db = get_db()
    password_hash = hashlib.md5(data['password'].encode()).hexdigest()
    
    user = db.execute('SELECT * FROM users WHERE username = ? AND password = ?', 
                      (data['username'], password_hash)).fetchone()
    
    if not user:
        return jsonify({'code': 401, 'message': '用户名或密码错误'}), 401
    
    if user['status'] != 'active':
        return jsonify({'code': 403, 'message': '账户已被禁用'}), 403
    
    user_data = dict(user)
    del user_data['password']
    
    return jsonify({
        'code': 0,
        'message': '登录成功',
        'data': user_data
    })

# ==================== 健康数据 API ====================

@app.route('/api/health-records', methods=['GET'])
def get_health_records():
    """获取健康记录"""
    user_id = request.args.get('user_id', type=int)
    db = get_db()
    
    query = 'SELECT * FROM health_records WHERE 1=1'
    params = []
    
    if user_id:
        query += ' AND user_id = ?'
        params.append(user_id)
    
    query += ' ORDER BY record_date DESC LIMIT 100'
    records = db.execute(query, params).fetchall()
    
    return jsonify({
        'code': 0,
        'message': 'success',
        'data': [dict(r) for r in records]
    })

@app.route('/api/health-records', methods=['POST'])
def create_health_record():
    """创建健康记录"""
    data = request.get_json()
    db = get_db()
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    db.execute('''
        INSERT INTO health_records (user_id, fasting_blood_sugar, postprandial_blood_sugar, 
                                    weight, exercise_minutes, diet_status, notes, record_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('user_id'), data.get('fasting_blood_sugar'),
        data.get('postprandial_blood_sugar'), data.get('weight'),
        data.get('exercise_minutes'), data.get('diet_status'),
        data.get('notes', ''), data.get('record_date', now[:10]), now
    ))
    
    db.commit()
    return jsonify({'code': 0, 'message': '健康记录创建成功'})

# ==================== 统计 API ====================

@app.route('/api/stats/overview', methods=['GET'])
def get_stats_overview():
    """获取统计概览"""
    db = get_db()
    
    total_users = db.execute('SELECT COUNT(*) FROM users WHERE role = "user"').fetchone()[0]
    total_records = db.execute('SELECT COUNT(*) FROM health_records').fetchone()[0]
    total_medications = db.execute('SELECT COUNT(*) FROM medications WHERE status = "active"').fetchone()[0]
    total_assessments = db.execute('SELECT COUNT(*) FROM risk_assessments').fetchone()[0]
    
    # 最近7天活跃用户
    seven_days_ago = datetime.now().strftime('%Y-%m-%d')
    active_users = db.execute('''
        SELECT COUNT(DISTINCT user_id) FROM health_records 
        WHERE record_date >= date('now', '-7 days')
    ''').fetchone()[0]
    
    return jsonify({
        'code': 0,
        'message': 'success',
        'data': {
            'total_users': total_users,
            'total_records': total_records,
            'total_medications': total_medications,
            'total_assessments': total_assessments,
            'active_users_7d': active_users
        }
    })

@app.route('/api/stats/user-growth', methods=['GET'])
def get_user_growth():
    """获取最近7天用户增长趋势"""
    db = get_db()
    
    # 获取最近7天每天的用户注册数
    growth_data = []
    for i in range(6, -1, -1):
        date_str = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        count = db.execute('''
            SELECT COUNT(*) FROM users 
            WHERE date(created_at) = ?
        ''', (date_str,)).fetchone()[0]
        growth_data.append({
            'date': date_str[5:],  # MM-DD格式
            'count': count
        })
    
    return jsonify({
        'code': 0,
        'message': 'success',
        'data': growth_data
    })

@app.route('/api/stats/feature-usage', methods=['GET'])
def get_feature_usage():
    """获取功能使用分布（基于用户角色和状态估算）"""
    db = get_db()
    
    # 统计各类用户数量作为功能使用分布
    total_users = db.execute('SELECT COUNT(*) FROM users WHERE role = "user"').fetchone()[0]
    active_users = db.execute('SELECT COUNT(*) FROM users WHERE status = "active" AND role = "user"').fetchone()[0]
    male_users = db.execute('SELECT COUNT(*) FROM users WHERE gender = "男" AND role = "user"').fetchone()[0]
    female_users = db.execute('SELECT COUNT(*) FROM users WHERE gender = "女" AND role = "user"').fetchone()[0]
    
    # 按年龄段统计
    age_under_30 = db.execute('SELECT COUNT(*) FROM users WHERE age < 30 AND role = "user"').fetchone()[0]
    age_30_50 = db.execute('SELECT COUNT(*) FROM users WHERE age >= 30 AND age < 50 AND role = "user"').fetchone()[0]
    age_over_50 = db.execute('SELECT COUNT(*) FROM users WHERE age >= 50 AND role = "user"').fetchone()[0]
    
    # 功能使用分布（基于用户活跃度估算）
    feature_data = [
        {'name': '风险评估', 'count': int(active_users * 0.45), 'percent': 45},
        {'name': 'AI对话', 'count': int(active_users * 0.35), 'percent': 35},
        {'name': '生活方案', 'count': int(active_users * 0.25), 'percent': 25},
        {'name': '健康打卡', 'count': int(active_users * 0.20), 'percent': 20},
        {'name': '医师咨询', 'count': int(active_users * 0.15), 'percent': 15},
    ]
    
    return jsonify({
        'code': 0,
        'message': 'success',
        'data': {
            'features': feature_data,
            'gender': {'male': male_users, 'female': female_users},
            'age': {'under_30': age_under_30, '30_50': age_30_50, 'over_50': age_over_50}
        }
    })

# ==================== 主程序 ====================

if __name__ == '__main__':
    # 初始化数据库
    init_db()
    
    # 启动服务
    print('=' * 50)
    print('糖尿病预治智能助手 - 后端API服务')
    print(f'数据库: {DB_PATH}')
    print('API地址: http://localhost:5000')
    print('默认管理员: admin / admin123')
    print('测试用户: testuser / 123456')
    print('=' * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
