import pandas as pd
import json
import numpy as np
from datetime import datetime
import re

class InsuranceDataProcessor:
    def __init__(self, csv_file_path):
        self.csv_file_path = csv_file_path
        self.df = None
        self.processed_products = []
        self.processed_customers = []
        
    def load_csv_data(self):
        """載入 CSV 資料"""
        try:
            # 讀取 CSV，處理編碼問題
            self.df = pd.read_csv(self.csv_file_path, encoding='utf-8')
            print(f"✅ 成功載入 {len(self.df)} 筆保單資料")
            
            # 顯示資料基本資訊
            print(f"📊 資料欄位數: {len(self.df.columns)}")
            print(f"📅 資料時間範圍: {self.df['保單受理日'].min()} 到 {self.df['保單受理日'].max()}")
            
            return True
        except Exception as e:
            print(f"❌ 載入 CSV 失敗: {e}")
            return False
    
    def analyze_products(self):
        """分析商品資訊"""
        if self.df is None:
            print("❌ 請先載入資料")
            return
        
        # 按商品分組統計
        product_stats = self.df.groupby(['商品英文簡稱', '商品中文簡稱']).agg({
            '保單號碼': 'count',
            '目前原幣別APE': 'mean',
            '被保人現在年齡': 'mean',
            '要保人年收入': 'mean',
            '保額': 'mean'
        }).round(2)
        
        print("📈 商品統計分析:")
        print(product_stats.head(10))
        
        return product_stats
    
    def extract_unique_products(self):
        """提取唯一商品清單"""
        unique_products = self.df[['商品英文簡稱', '商品中文簡稱', 'PRODUCT_TYPE']].drop_duplicates()
        
        print(f"📦 發現 {len(unique_products)} 個不同商品:")
        for _, product in unique_products.iterrows():
            print(f"  - {product['商品中文簡稱']} ({product['商品英文簡稱']})")
        
        return unique_products
    
    def generate_product_database(self):
        """生成商品資料庫"""
        unique_products = self.extract_unique_products()
        products_db = []
        
        for _, product_row in unique_products.iterrows():
            # 獲取該商品的所有保單資料
            product_data = self.df[self.df['商品英文簡稱'] == product_row['商品英文簡稱']]
            
            # 計算統計資訊
            avg_premium = product_data['目前原幣別APE'].mean()
            avg_age = product_data['被保人現在年齡'].mean()
            age_range = {
                'min': int(product_data['被保人現在年齡'].min()),
                'max': int(product_data['被保人現在年齡'].max())
            }
            
            # 分析適合族群
            suitable_groups = self.analyze_suitable_groups(product_data)
            
            # 生成商品特色
            features = self.generate_product_features(product_row['商品中文簡稱'])
            
            product_info = {
                'id': f"PCA_{product_row['商品英文簡稱']}",
                'name': product_row['商品中文簡稱'],
                'code': product_row['商品英文簡稱'],
                'company': '保誠人壽',
                'type': self.map_product_type(product_row['商品中文簡稱']),
                'category': product_row['PRODUCT_TYPE'],
                'description': self.generate_description(product_row['商品中文簡稱']),
                'premium': {
                    'monthly': self.calculate_age_based_premium(avg_premium, avg_age),
                    'currency': self.detect_currency(product_data)
                },
                'age_range': age_range,
                'rating': round(np.random.uniform(4.0, 4.8), 1),  # 模擬評分
                'suitable_for': suitable_groups,
                'features': features,
                'stats': {
                    'total_policies': len(product_data),
                    'avg_age': round(avg_age, 1),
                    'avg_premium': round(avg_premium, 2)
                }
            }
            
            products_db.append(product_info)
        
        self.processed_products = products_db
        return products_db
    
    def map_product_type(self, product_name):
        """根據商品名稱映射產品類型"""
        if any(keyword in product_name for keyword in ['醫療', '健康', '照護']):
            return 'health'
        elif any(keyword in product_name for keyword in ['意外', '傷害']):
            return 'accident'
        elif any(keyword in product_name for keyword in ['壽險', '終身']):
            return 'life'
        elif any(keyword in product_name for keyword in ['投資', '變額']):
            return 'investment'
        else:
            return 'life'  # 預設為壽險
    
    def detect_currency(self, product_data):
        """偵測幣別"""
        currency = product_data['幣別'].iloc[0] if '幣別' in product_data.columns else 'TWD'
        return 'TWD' if currency == 'NT$' else currency
    
    def calculate_age_based_premium(self, base_premium, base_age):
        """根據年齡計算保費"""
        if pd.isna(base_premium) or base_premium == 0:
            base_premium = 5000  # 預設保費
        
        return {
            'age_20': int(base_premium * 0.7),
            'age_30': int(base_premium),
            'age_40': int(base_premium * 1.3),
            'age_50': int(base_premium * 1.8),
            'age_60': int(base_premium * 2.5)
        }
    
    def analyze_suitable_groups(self, product_data):
        """分析適合族群"""
        suitable_groups = []
        
        # 根據年齡分析
        avg_age = product_data['被保人現在年齡'].mean()
        if avg_age < 35:
            suitable_groups.append('年輕族群')
        elif avg_age > 50:
            suitable_groups.append('中年族群')
        
        # 根據收入分析
        avg_income = product_data['要保人年收入'].mean()
        if avg_income > 100:
            suitable_groups.append('高收入族群')
        elif avg_income < 50:
            suitable_groups.append('預算有限')
        
        # 根據婚姻狀況分析
        married_ratio = len(product_data[product_data['要保人婚姻狀況'] == 'M']) / len(product_data)
        if married_ratio > 0.6:
            suitable_groups.append('家庭責任重')
        
        return suitable_groups if suitable_groups else ['一般大眾']
    
    def generate_product_features(self, product_name):
        """根據商品名稱生成特色"""
        features = []
        
        if '終身' in product_name:
            features.append('終身保障')
        if '外幣' in product_name:
            features.append('外幣計價')
        if '定期給付' in product_name:
            features.append('定期給付')
        if '定額給付' in product_name:
            features.append('定額給付')
        if '壽險' in product_name:
            features.append('身故保障')
        
        # 加入通用特色
        features.extend(['專業理賠服務', '彈性繳費方式'])
        
        return features[:5]  # 最多5個特色
    
    def generate_description(self, product_name):
        """生成商品描述"""
        base_desc = f"保誠人壽{product_name}是一款專業設計的保險商品，"
        
        if '終身' in product_name:
            base_desc += "提供終身保障，"
        if '外幣' in product_name:
            base_desc += "採用外幣計價，分散匯率風險，"
        if '壽險' in product_name:
            base_desc += "提供完整的身故保障，"
        
        base_desc += "適合不同人生階段的保障需求。"
        
        return base_desc
    
    def generate_customer_personas(self):
        """生成客戶畫像"""
        customer_analysis = []
        
        # 按年齡分組
        age_groups = [(18, 30), (31, 45), (46, 65)]
        
        for min_age, max_age in age_groups:
            group_data = self.df[
                (self.df['被保人現在年齡'] >= min_age) & 
                (self.df['被保人現在年齡'] <= max_age)
            ]
            
            if len(group_data) > 0:
                persona = {
                    'age_group': f'{min_age}-{max_age}歲',
                    'count': len(group_data),
                    'avg_premium': group_data['目前原幣別APE'].mean(),
                    'popular_products': group_data['商品中文簡稱'].value_counts().head(3).to_dict(),
                    'avg_income': group_data['要保人年收入'].mean(),
                    'gender_ratio': group_data['被保人性別'].value_counts().to_dict()
                }
                customer_analysis.append(persona)
        
        return customer_analysis
    
    def save_processed_data(self):
        """儲存處理後的資料"""
        # 儲存商品資料庫
        with open('data/real_insurance_data.json', 'w', encoding='utf-8') as f:
            json.dump(self.processed_products, f, ensure_ascii=False, indent=2)
        
        # 儲存客戶分析
        customer_personas = self.generate_customer_personas()
        with open('data/customer_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(customer_personas, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 已儲存 {len(self.processed_products)} 個商品到 real_insurance_data.json")
        print(f"✅ 已儲存客戶分析到 customer_analysis.json")
    
    def generate_summary_report(self):
        """生成摘要報告"""
        if self.df is None:
            return
        
        report = {
            '資料概況': {
                '總保單數': len(self.df),
                '商品種類數': len(self.df['商品中文簡稱'].unique()),
                '客戶數': len(self.df['要保人ID'].unique())
            },
            '年齡分布': {
                '平均年齡': round(self.df['被保人現在年齡'].mean(), 1),
                '最小年齡': int(self.df['被保人現在年齡'].min()),
                '最大年齡': int(self.df['被保人現在年齡'].max())
            },
            '保費分析': {
                '平均年繳保費': round(self.df['目前原幣別APE'].mean(), 2),
                '保費中位數': round(self.df['目前原幣別APE'].median(), 2)
            },
            '熱門商品': self.df['商品中文簡稱'].value_counts().head(5).to_dict()
        }
        
        # 儲存報告
        with open('data/data_summary.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print("📊 資料摘要報告:")
        print(json.dumps(report, ensure_ascii=False, indent=2))
        
        return report

# 使用範例
if __name__ == "__main__":
    # 使用方法
    processor = InsuranceDataProcessor('data/insurance_policies.csv')
    
    if processor.load_csv_data():
        processor.analyze_products()
        processor.extract_unique_products()
        
        # 生成商品資料庫
        products = processor.generate_product_database()
        
        # 儲存處理後的資料
        processor.save_processed_data()
        
        # 生成摘要報告
        processor.generate_summary_report()
        
        print(f"\n🎉 資料處理完成！生成了 {len(products)} 個商品")