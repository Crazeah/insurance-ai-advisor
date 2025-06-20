from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import os
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# 載入保險資料
def load_insurance_data():
    try:
        # 優先載入真實資料
        real_data_path = os.path.join(os.path.dirname(__file__), 'data', 'real_insurance_data.json')
        if os.path.exists(real_data_path):
            with open(real_data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"✅ 載入真實保險資料: {len(data)} 個商品")
                return data
        
        # 備用：載入測試資料
        test_data_path = os.path.join(os.path.dirname(__file__), 'data', 'insurance_data.json')
        if os.path.exists(test_data_path):
            with open(test_data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"✅ 載入測試資料: {len(data)} 個商品")
                return data
        
        print("❌ 找不到任何保險資料檔案")
        return []
        
    except Exception as e:
        print(f"❌ 載入保險資料失敗: {e}")
        return []

insurance_data = load_insurance_data()

@app.route('/api/products', methods=['GET'])
def get_products():
    """獲取所有產品"""
    return jsonify({
        'success': True,
        'data': insurance_data,
        'count': len(insurance_data)
    })

@app.route('/api/recommend', methods=['POST'])
def recommend():
    """推薦保險產品"""
    try:
        user_data = request.json
        age = user_data.get('age', 30)
        budget = user_data.get('budget', 5000)
        needs = user_data.get('needs', [])
        
        # 篩選適合的產品
        suitable_products = []
        for product in insurance_data:
            # 年齡篩選
            age_range = product.get('age_range', {})
            if not (age_range.get('min', 0) <= age <= age_range.get('max', 100)):
                continue
            
            # 預算篩選
            premium = product.get('premium', {}).get('monthly', {}).get('age_30', 999999)
            if premium > budget:
                continue
            
            # 需求匹配評分
            score = 0.5  # 基礎分數
            suitable_for = product.get('suitable_for', [])
            
            # 根據需求加分
            if '健康保障' in needs and product.get('type') == 'health':
                score += 0.3
            if '退休規劃' in needs and product.get('type') == 'life':
                score += 0.3
            if '意外保障' in needs and product.get('type') == 'accident':
                score += 0.3
            if '投資理財' in needs and product.get('type') == 'investment':
                score += 0.3
            
            # 年齡匹配加分
            optimal_age = (age_range.get('min', 0) + age_range.get('max', 100)) / 2
            age_match = max(0, 1 - abs(age - optimal_age) / 30)
            score += age_match * 0.2
            
            # 產品評分加分
            rating = product.get('rating', 4.0)
            score += (rating / 5.0) * 0.1
            
            product_copy = product.copy()
            product_copy['recommendation_score'] = round(min(score, 1.0), 2)
            suitable_products.append(product_copy)
        
        # 排序取前5名
        suitable_products.sort(key=lambda x: x['recommendation_score'], reverse=True)
        
        return jsonify({
            'success': True,
            'data': suitable_products[:5],
            'user_profile': user_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'推薦失敗: {str(e)}'
        }), 500

@app.route('/api/risk-assessment', methods=['POST'])
def risk_assessment():
    """風險評估"""
    try:
        user_data = request.json
        age = user_data.get('age', 30)
        income = user_data.get('income', 50000)
        health = user_data.get('health', 'good')
        family = user_data.get('family', 'single')
        
        # 計算各類風險
        health_risk = calculate_health_risk(age, health)
        financial_risk = calculate_financial_risk(income)
        family_risk = calculate_family_risk(family)
        
        return jsonify({
            'success': True,
            'data': {
                'health': health_risk,
                'financial': financial_risk,
                'family': family_risk
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'風險評估失敗: {str(e)}'
        }), 500

def calculate_health_risk(age, health):
    """計算健康風險"""
    # 年齡風險基數
    age_factor = min(age * 0.8, 60)
    
    health_multiplier = {
        'excellent': 0.4,
        'good': 0.6,
        'fair': 0.8,
        'poor': 1.2
    }
    
    multiplier = health_multiplier.get(health, 0.6)
    final_score = int(age_factor * multiplier)
    
    if final_score < 25:
        level = 'low'
        recommendation = '健康狀況良好，維持現有生活方式，定期健檢即可'
    elif final_score < 55:
        level = 'medium'
        recommendation = '建議購買基本醫療保險，加強健康管理和運動'
    else:
        level = 'high'
        recommendation = '強烈建議購買完整醫療保險，密切關注健康狀況'
    
    return {
        'score': final_score,
        'level': level,
        'recommendation': recommendation
    }

def calculate_financial_risk(income):
    """計算財務風險"""
    if income >= 100000:
        score = 15
        level = 'low'
        recommendation = '財務狀況優秀，可考慮高保額或投資型保險'
    elif income >= 60000:
        score = 35
        level = 'low'
        recommendation = '財務狀況良好，建議保險支出控制在收入12-15%'
    elif income >= 40000:
        score = 55
        level = 'medium'
        recommendation = '建議保險支出控制在收入10-12%，優先基本保障'
    else:
        score = 80
        level = 'high'
        recommendation = '優先購買最基本保障，保費控制在收入8%以內'
    
    return {
        'score': score,
        'level': level,
        'recommendation': recommendation
    }

def calculate_family_risk(family):
    """計算家庭風險"""
    family_risk_map = {
        'single': {
            'score': 25,
            'level': 'low',
            'recommendation': '單身族群風險相對較低，重點關注個人醫療和意外保障'
        },
        'married': {
            'score': 45,
            'level': 'medium', 
            'recommendation': '已婚夫妻需要雙方保障，建議增加壽險保額'
        },
        'married_kids': {
            'score': 75,
            'level': 'high',
            'recommendation': '家庭責任重大，需要充足的壽險保障，確保子女教育資金'
        }
    }
    
    return family_risk_map.get(family, family_risk_map['single'])

@app.route('/api/chat', methods=['POST'])
def chat():
    """智能聊天功能"""
    try:
        data = request.json
        message = data.get('message', '').lower()
        
        # 智能關鍵字回應
        if any(word in message for word in ['健康險', '醫療險', '醫療']):
            response = '健康險是最重要的基礎保障！我推薦考慮以下幾點：\n\n• 住院醫療：建議日額2000-3000元\n• 手術費用：至少10-15萬保額\n• 重大疾病：建議50-100萬一次給付\n\n我們有「保誠富御守護」和「台灣人壽新康健」等優質選擇。'
            
        elif any(word in message for word in ['壽險', '生命保險', '身故']):
            response = '壽險主要提供身故保障，適合有家庭責任的人：\n\n• 建議保額：年收入的10-15倍\n• 分紅型：可參與公司盈餘分配\n• 定期型：保費便宜，保障高\n\n「保誠美滿人生」是不錯的分紅型選擇。'
            
        elif any(word in message for word in ['意外險', '意外', '職業傷害']):
            response = '意外險CP值最高！特色包括：\n\n• 保費便宜：通常月繳1000元內\n• 保障高：可達百萬以上\n• 24小時保障：不分時間地點\n• 職業加成：特定職業有額外保障\n\n推薦「保誠安心意外險」，性價比極佳！'
            
        elif any(word in message for word in ['保費', '價格', '多少錢', '費用']):
            response = '保費計算有幾個重要因素：\n\n• 年齡：越年輕保費越便宜\n• 性別：通常女性保費較低\n• 保額：保障越高保費越貴\n• 健康狀況：影響核保結果\n\n建議保險總支出控制在月收入10-15%。需要我幫您試算嗎？'
            
        elif any(word in message for word in ['推薦', '建議', '適合', '選擇']):
            response = '為您推薦最適合的保險，我需要了解：\n\n• 您的年齡和職業\n• 月收入範圍\n• 家庭狀況（單身/已婚/有小孩）\n• 最關心的保障需求\n\n請先填寫「推薦保單」頁面的基本資料，我會為您量身推薦！'
            
        elif any(word in message for word in ['理賠', '申請', '給付']):
            response = '理賠流程簡單明確：\n\n1. 立即通報：事故發生後盡快聯絡保險公司\n2. 準備文件：診斷證明、收據、申請書等\n3. 送件審核：可線上或臨櫃辦理\n4. 快速給付：一般3-7個工作天\n\n我們致力於提供快速、透明的理賠服務！'
            
        elif any(word in message for word in ['年輕人', '年輕', '新鮮人', '20', '30']):
            response = '年輕人保險規劃建議：\n\n• 優先順序：意外險 → 健康險 → 壽險\n• 預算控制：月收入8-12%\n• 保障重點：醫療和意外為主\n• 投保優勢：保費便宜、核保容易\n\n推薦組合：意外險(800元) + 醫療險(3000元) = 月繳不到4000元！'
            
        elif any(word in message for word in ['家庭', '小孩', '子女', '教育']):
            response = '家庭保障規劃重點：\n\n• 雙薪家庭：夫妻都要有足夠保障\n• 主要收入者：壽險保額要充足\n• 子女保障：意外險和醫療險\n• 教育基金：可考慮儲蓄險或投資型保險\n\n家庭責任重大，建議找專業顧問詳細規劃！'
            
        else:
            responses = [
                '我是您的專屬保險智能顧問！我可以幫您：\n\n• 推薦適合的保險商品\n• 進行個人風險評估\n• 解答保險相關問題\n• 協助保險規劃\n\n有什麼想了解的嗎？',
                '歡迎諮詢保險相關問題！您可以問我：\n\n• 「健康險怎麼選？」\n• 「年輕人需要什麼保險？」\n• 「保費大概多少？」\n• 「意外險有什麼好處？」',
                '我擁有豐富的保險知識，可以為您解答任何問題。建議您先完成「推薦保單」的需求分析，我會為您提供個人化建議！'
            ]
            response = random.choice(responses)
        
        return jsonify({
            'success': True,
            'response': response
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'聊天服務錯誤: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康檢查端點"""
    return jsonify({
        'success': True,
        'message': '保險 API 服務正常運行',
        'products_count': len(insurance_data)
    })

# 新增客戶分析 API
@app.route('/api/customer-analysis', methods=['GET'])
def get_customer_analysis():
    """獲取客戶分析資料"""
    try:
        analysis_path = os.path.join(os.path.dirname(__file__), 'data', 'customer_analysis.json')
        if os.path.exists(analysis_path):
            with open(analysis_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return jsonify({
                    'success': True,
                    'data': data
                })
        else:
            return jsonify({
                'success': False,
                'message': '客戶分析資料不存在'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'載入客戶分析失敗: {str(e)}'
        }), 500

# 新增資料摘要 API
@app.route('/api/data-summary', methods=['GET'])
def get_data_summary():
    """獲取資料摘要"""
    try:
        summary_path = os.path.join(os.path.dirname(__file__), 'data', 'data_summary.json')
        if os.path.exists(summary_path):
            with open(summary_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return jsonify({
                    'success': True,
                    'data': data
                })
        else:
            return jsonify({
                'success': False,
                'message': '資料摘要不存在'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'載入資料摘要失敗: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 智慧保險顧問 API 啟動中...")
    print("📍 API 地址: http://localhost:5000")
    print("📊 載入產品數量:", len(insurance_data))
    print("💡 可用端點:")
    print("   - GET  /api/health")
    print("   - GET  /api/products") 
    print("   - POST /api/recommend")
    print("   - POST /api/risk-assessment")
    print("   - POST /api/chat")
    app.run(debug=True, host='0.0.0.0', port=5000)