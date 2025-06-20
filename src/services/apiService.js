

const API_BASE_URL = 'http://localhost:5000/api';

export class InsuranceAPIService {
  async getAllProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('獲取產品列表失敗:', error);
      return [];
    }
  }

  async getRecommendations(userProfile) {
    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile)
      });
      const data = await response.json();
      console.log('推薦結果:', data);
      return data.success ? data.data : [];
    } catch (error) {
      console.error('獲取推薦失敗:', error);
      return [];
    }
  }

  async getRiskAssessment(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/risk-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      console.log('風險評估結果:', data);
      return data.success ? data.data : null;
    } catch (error) {
      console.error('風險評估失敗:', error);
      return null;
    }
  }

  async sendChatMessage(message) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      return data.success ? data.response : '抱歉，暫時無法回應';
    } catch (error) {
      console.error('聊天服務失敗:', error);
      return '網路連線異常，請稍後再試';
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('API 健康檢查失敗:', error);
      return false;
    }
  }
}

export default new InsuranceAPIService();