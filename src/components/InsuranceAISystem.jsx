import React, { useState, useRef, useEffect } from 'react';
import { Shield, MessageCircle, BarChart3, TrendingUp, User, ChevronRight, Star, AlertCircle, CheckCircle2, Brain, Calculator, Heart, Home, Car, Briefcase } from 'lucide-react';
import apiService from '../services/apiService';

const InsuranceAISystem = () => {
  const [activeTab, setActiveTab] = useState('recommend');
  const [userProfile, setUserProfile] = useState({
    age: '',
    income: '',
    family: '',
    health: '',
    needs: []
  });
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      content: '您好！我是您的專屬保險顧問。請告訴我您的需求，我會為您提供最適合的保險建議。'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const chatEndRef = useRef(null);
  const [dataSummary, setDataSummary] = useState(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // 分析用戶需求
  const analyzeUserNeeds = async () => {
    if (!userProfile.age || !userProfile.income) {
      alert('請填寫年齡和月收入');
      return;
    }

    setIsAnalyzing(true);
    setApiError(null);
    
    try {
      // 計算保險預算並確保合理
      const monthlyBudget = Math.max(
        Math.round(parseInt(userProfile.income) * 0.15), 
        5000  // 最低預算5000元
      );
      
      const requestData = {
        age: parseInt(userProfile.age),
        budget: monthlyBudget,
        needs: userProfile.needs || [],
        health: userProfile.health || 'good',
        family: userProfile.family || 'single'
      };
      
      console.log('準備發送的資料:', requestData);
      
      // 先測試 API 是否正常
      const healthCheck = await apiService.healthCheck();
      if (!healthCheck) {
        throw new Error('後端服務無法連接，請確認後端是否啟動');
      }
      
      // 呼叫推薦 API
      const recommendedProducts = await apiService.getRecommendations(requestData);
      console.log('收到推薦產品:', recommendedProducts);

      // 確保 recommendedProducts 是陣列
      setRecommendations(Array.isArray(recommendedProducts) ? recommendedProducts : []);

      // 呼叫風險評估 API
      const riskData = await apiService.getRiskAssessment({
        age: parseInt(userProfile.age),
        income: parseInt(userProfile.income),
        health: userProfile.health || 'good',
        family: userProfile.family || 'single'
      });

      setRiskAssessment(riskData);
      
      if (recommendedProducts && recommendedProducts.length > 0) {
        alert(`✅ 成功為您推薦 ${recommendedProducts.length} 個保險方案！`);
      } else {
        alert('⚠️ 目前沒有找到符合條件的方案，請調整條件後重試。');
      }
      
    } catch (error) {
      console.error('分析失敗:', error);
      setApiError(error.message);
      alert(`❌ 系統錯誤: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
      setActiveTab('recommend');
    }
  };

  // 處理聊天
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = { type: 'user', content: inputMessage };
    setChatMessages(prev => [...prev, newMessage]);

    try {
      const aiResponse = await apiService.sendChatMessage(inputMessage);
      setChatMessages(prev => [...prev, { type: 'ai', content: aiResponse }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        content: '抱歉，我現在無法回應。請確認網路連線或稍後再試。' 
      }]);
    }

    setInputMessage('');
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskText = (level) => {
    switch (level) {
      case 'high': return '高風險';
      case 'medium': return '中等風險';
      case 'low': return '低風險';
      default: return '未評估';
    }
  };

  // 加入新的 API 調用
  const loadDataSummary = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/data-summary');
      const data = await response.json();
      if (data.success) {
        setDataSummary(data.data);
      }
    } catch (error) {
      console.error('載入資料摘要失敗:', error);
    }
  };
  useEffect(() => {
    loadDataSummary();
  }, []);

  // 範例問題
  const exampleQuestions = [
    '我想為家人購買健康險，應該選擇哪種方案？',
    '30歲上班族適合什麼保險組合？',
    '如何規劃退休保險，需要考慮哪些因素？',
    '我月收入6萬元，應該如何分配保險與投資？',
    '如何建立緊急基金？需要儲蓄多少才夠？'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  智慧保險顧問
                </h1>
                <p className="text-sm text-gray-600">AI驅動的個性化保單推薦系統</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                apiError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {apiError ? '⚠️ 服務異常' : '✨ AI 助手在線'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'recommend', label: '推薦保單', icon: Shield },
              { id: 'chat', label: '智能問答', icon: MessageCircle },
              { id: 'risk', label: '風險評估', icon: BarChart3 },
              { id: 'planning', label: '財務規劃', icon: Calculator }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 錯誤提示 */}
        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">系統連線異常</h3>
                <p className="text-sm text-red-600">{apiError}</p>
                <p className="text-xs text-red-500 mt-1">
                  請確認後端服務是否正常啟動（http://localhost:5000）
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 推薦保單頁面 */}
        {activeTab === 'recommend' && (
          <div className="space-y-8">
            {/* 用戶資料收集 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">告訴我們關於您的資訊</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年齡</label>
                  <input
                    type="number"
                    value={userProfile.age}
                    onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
                    placeholder="請輸入您的年齡"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">月收入 (新台幣)</label>
                  <input
                    type="number"
                    value={userProfile.income}
                    onChange={(e) => setUserProfile({...userProfile, income: e.target.value})}
                    placeholder="例如：50000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">家庭狀況</label>
                  <select
                    value={userProfile.family}
                    onChange={(e) => setUserProfile({...userProfile, family: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">請選擇</option>
                    <option value="single">單身</option>
                    <option value="married">已婚無子女</option>
                    <option value="married_kids">已婚有子女</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">健康狀況</label>
                  <select
                    value={userProfile.health}
                    onChange={(e) => setUserProfile({...userProfile, health: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">請選擇</option>
                    <option value="excellent">非常健康</option>
                    <option value="good">健康良好</option>
                    <option value="fair">一般</option>
                    <option value="poor">需要關注</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">您最關心的保障需求 (可多選)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['健康保障', '退休規劃', '資產傳承', '意外保障', '投資理財', '子女教育'].map(need => (
                    <label key={need} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userProfile.needs?.includes(need) || false}
                        onChange={(e) => {
                          const currentNeeds = userProfile.needs || [];
                          if (e.target.checked) {
                            setUserProfile({...userProfile, needs: [...currentNeeds, need]});
                          } else {
                            setUserProfile({...userProfile, needs: currentNeeds.filter(n => n !== need)});
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{need}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                onClick={analyzeUserNeeds}
                disabled={isAnalyzing}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI 分析中...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>開始智能分析</span>
                  </div>
                )}
              </button>
            </div>

            {/* 推薦結果 */}
            {recommendations && recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">為您推薦的保險方案</h2>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    找到 {recommendations.length} 個適合方案
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {recommendations.map((policy, index) => (
                    <div key={policy.id || index} className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                      {index === 0 && (
                        <div className="absolute -top-3 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          ⭐ 最推薦
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Heart className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{policy.name || '保險產品'}</h3>
                          <p className="text-sm text-gray-600">{policy.company || '保險公司'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">月繳保費</span>
                          <span className="text-lg font-bold text-blue-600">
                            NT$ {(policy.premium?.monthly?.age_30 || policy.monthly_premium || 0).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(policy.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">{policy.rating || 4.0}</span>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">保障內容：</p>
                          <div className="space-y-1">
                            {(policy.features || ['基本保障', '理賠服務']).slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {(policy.suitable_for || ['一般大眾']).slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {policy.recommendation_score && (
                          <div className="bg-green-50 p-2 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-green-700">推薦度</span>
                              <span className="text-sm font-bold text-green-800">
                                {Math.round(policy.recommendation_score * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2">
                        <span>了解詳情</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 智能問答頁面 */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6" />
                  <div>
                    <h2 className="text-lg font-semibold">AI 保險顧問助手</h2>
                    <p className="text-sm text-blue-100">隨時為您解答保險相關問題</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(chatMessages || []).map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Example Questions */}
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-3">常見問題範例：</p>
                <div className="grid grid-cols-1 gap-2">
                  {exampleQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputMessage(question);
                        // 自動發送
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    >
                      💡 {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="請輸入您的問題..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    發送
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 風險評估頁面 */}
        {activeTab === 'risk' && (
          <div className="space-y-8">
            {riskAssessment ? (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">個人風險評估報告</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {Object.entries(riskAssessment || {}).map(([key, risk]) => {
                    const titles = {
                      health: '健康風險',
                      financial: '財務風險', 
                      family: '家庭風險'
                    };
                    
                    if (!risk || typeof risk !== 'object') return null;
                    
                    return (
                      <div key={key} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">{titles[key]}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk.level)}`}>
                            {getRiskText(risk.level)}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>風險指數</span>
                            <span>{risk.score || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                risk.level === 'high' ? 'bg-red-500' : 
                                risk.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${risk.score || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800">{risk.recommendation || '建議諮詢專業顧問'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">綜合建議</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• 根據您的整體風險評估，建議優先考慮健康險和意外險</p>
                    <p>• 建議每月保險支出控制在收入的10-15%之間</p>
                    <p>• 定期檢視保險需求，隨著人生階段調整保障內容</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">尚未進行風險評估</h3>
                <p className="text-gray-600 mb-6">請先填寫基本資料並進行需求分析，系統將為您生成個人化的風險評估報告</p>
                <button
                  onClick={() => setActiveTab('recommend')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  立即開始評估
                </button>
              </div>
            )}
          </div>
        )}

        {/* 財務規劃頁面 */}
        {activeTab === 'planning' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">財務規劃功能</h3>
            <p className="text-gray-600 mb-6">此功能正在開發中，敬請期待</p>
            <button
              onClick={() => setActiveTab('recommend')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              返回推薦保單
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceAISystem;