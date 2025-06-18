import React, { useState, useRef, useEffect } from 'react';
import { Shield, MessageCircle, BarChart3, TrendingUp, User, ChevronRight, Star, AlertCircle, CheckCircle2, Brain, Calculator, Heart, Home, Car, Briefcase } from 'lucide-react';

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
  const chatEndRef = useRef(null);

  // 模擬保單資料
  const insurancePolicies = [
    {
      id: 1,
      name: '全方位健康守護險',
      type: 'health',
      company: '台灣人壽',
      premium: 3500,
      coverage: ['住院醫療', '手術給付', '重大疾病', '癌症保障'],
      ageRange: { min: 20, max: 65 },
      rating: 4.8,
      suitable: ['年輕族群', '健康意識高'],
      icon: <Heart className="w-6 h-6" />
    },
    {
      id: 2,
      name: '黃金歲月退休計劃',
      type: 'retirement',
      company: '國泰人壽',
      premium: 8000,
      coverage: ['退休年金', '身故保障', '完全失能給付'],
      ageRange: { min: 25, max: 55 },
      rating: 4.6,
      suitable: ['中年族群', '退休規劃'],
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      id: 3,
      name: '家庭責任保障險',
      type: 'life',
      company: '富邦人壽',
      premium: 2800,
      coverage: ['壽險保障', '意外保障', '家庭責任'],
      ageRange: { min: 25, max: 60 },
      rating: 4.5,
      suitable: ['家庭責任重', '經濟支柱'],
      icon: <Home className="w-6 h-6" />
    },
    {
      id: 4,
      name: '創業家財富保障',
      type: 'investment',
      company: '新光人壽',
      premium: 12000,
      coverage: ['投資型保險', '資產保全', '稅務規劃'],
      ageRange: { min: 30, max: 65 },
      rating: 4.4,
      suitable: ['高收入族群', '資產管理'],
      icon: <Briefcase className="w-6 h-6" />
    }
  ];

  // 範例問題
  const exampleQuestions = [
    '我想為家人購買健康險，應該選擇哪種方案？',
    '30歲上班族適合什麼保險組合？',
    '如何規劃退休保險，需要考慮哪些因素？',
    '我月收入6萬元，應該如何分配保險與投資？',
    '如何建立緊急基金？需要儲蓄多少才夠？'
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // 分析用戶需求
  const analyzeUserNeeds = () => {
    if (!userProfile.age || !userProfile.income) {
      alert('請填寫基本資料');
      return;
    }

    setIsAnalyzing(true);
    
    // 模擬分析過程
    setTimeout(() => {
      const age = parseInt(userProfile.age);
      const income = parseInt(userProfile.income);
      
      // 根據年齡和收入推薦保單
      let filtered = insurancePolicies.filter(policy => 
        age >= policy.ageRange.min && 
        age <= policy.ageRange.max &&
        policy.premium <= income * 0.15 // 保費不超過收入15%
      );

      // 根據需求調整推薦
      if (userProfile.needs.includes('健康保障')) {
        filtered = filtered.sort((a, b) => 
          (a.type === 'health' ? -1 : 1) - (b.type === 'health' ? -1 : 1)
        );
      }

      setRecommendations(filtered.slice(0, 3));
      
      // 生成風險評估
      const assessment = generateRiskAssessment(age, income, userProfile.health, userProfile.family);
      setRiskAssessment(assessment);
      
      setIsAnalyzing(false);
      setActiveTab('recommend');
    }, 2000);
  };

  // 生成風險評估
  const generateRiskAssessment = (age, income, health, family) => {
    const healthRisk = health === 'poor' ? 'high' : health === 'fair' ? 'medium' : 'low';
    const financialRisk = income < 40000 ? 'high' : income < 80000 ? 'medium' : 'low';
    const familyRisk = family === 'married_kids' ? 'high' : family === 'married' ? 'medium' : 'low';

    return {
      health: {
        level: healthRisk,
        score: healthRisk === 'high' ? 80 : healthRisk === 'medium' ? 50 : 20,
        recommendation: healthRisk === 'high' ? '建議加強醫療保障' : '維持基本健康保險'
      },
      financial: {
        level: financialRisk,
        score: financialRisk === 'high' ? 75 : financialRisk === 'medium' ? 45 : 15,
        recommendation: financialRisk === 'high' ? '增加緊急預備金' : '可考慮投資型保險'
      },
      family: {
        level: familyRisk,
        score: familyRisk === 'high' ? 85 : familyRisk === 'medium' ? 40 : 10,
        recommendation: familyRisk === 'high' ? '需要充足家庭保障' : '基本壽險即可'
      }
    };
  };

  // 處理聊天
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = { type: 'user', content: inputMessage };
    setChatMessages(prev => [...prev, newMessage]);

    // 模擬AI回應
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setChatMessages(prev => [...prev, { type: 'ai', content: aiResponse }]);
    }, 1000);

    setInputMessage('');
  };

  // 生成AI回應
  const generateAIResponse = (message) => {
    if (message.includes('健康險')) {
      return '基於您的需求，我推薦「全方位健康守護險」，它提供完整的醫療保障，包括住院、手術和重大疾病保障，月繳保費3,500元，非常適合注重健康的您。';
    } else if (message.includes('退休')) {
      return '退休規劃很重要！建議您考慮「黃金歲月退休計劃」，這是一個結合保障與儲蓄的方案，可以幫您在退休後維持生活品質。根據您的年齡，建議每月投保8,000元。';
    } else if (message.includes('月收入') || message.includes('6萬')) {
      return '以月收入6萬元來說，建議保險支出控制在6,000-9,000元之間（約10-15%）。可以配置：健康險3,500元 + 意外險1,000元 + 壽險2,000元，剩餘資金可投資理財。';
    }
    return '感謝您的提問！根據您的情況，我建議您先完成需求分析，這樣我能為您提供更精準的保險建議。您也可以點擊「推薦保單」查看適合的方案。';
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
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✨ AI 助手在線
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
                        checked={userProfile.needs.includes(need)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserProfile({...userProfile, needs: [...userProfile.needs, need]});
                          } else {
                            setUserProfile({...userProfile, needs: userProfile.needs.filter(n => n !== need)});
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
            {recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">為您推薦的保險方案</h2>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    找到 {recommendations.length} 個適合方案
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {recommendations.map((policy, index) => (
                    <div key={policy.id} className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                      {index === 0 && (
                        <div className="absolute -top-3 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          ⭐ 最推薦
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {policy.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{policy.name}</h3>
                          <p className="text-sm text-gray-600">{policy.company}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">月繳保費</span>
                          <span className="text-lg font-bold text-blue-600">NT$ {policy.premium.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(policy.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">{policy.rating}</span>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">保障內容：</p>
                          <div className="space-y-1">
                            {policy.coverage.map(item => (
                              <div key={item} className="flex items-center space-x-2">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {policy.suitable.map(tag => (
                            <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
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
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
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
                        handleSendMessage();
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
                  {Object.entries(riskAssessment).map(([key, risk]) => {
                    const titles = {
                      health: '健康風險',
                      financial: '財務風險', 
                      family: '家庭風險'
                    };
                    
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
                            <span>{risk.score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                risk.level === 'high' ? 'bg-red-500' : 
                                risk.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${risk.score}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800">{risk.recommendation}</p>
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
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Calculator className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">智能財務規劃建議</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* 緊急基金規劃 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">緊急基金建立</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">建議儲蓄目標</span>
                      <span className="font-semibold text-green-600">
                        {userProfile.income ? `NT$ ${(parseInt(userProfile.income) * 6).toLocaleString()}` : 'NT$ 300,000'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      建議儲蓄 6 個月的生活費作為緊急預備金
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-sm text-gray-700">
                        💡 <strong>建議策略：</strong><br/>
                        • 每月定期存入 {userProfile.income ? Math.round(parseInt(userProfile.income) * 0.2) : 10000} 元<br/>
                        • 選擇高流動性儲蓄商品<br/>
                        • 分散風險，不要全放定存
                      </div>
                    </div>
                  </div>
                </div>

                {/* 保險規劃 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">保險配置建議</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">建議保險預算</span>
                      <span className="font-semibold text-blue-600">
                        {userProfile.income ? `NT$ ${Math.round(parseInt(userProfile.income) * 0.15).toLocaleString()}` : 'NT$ 7,500'} / 月
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      約佔收入 15% 的保險支出
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-sm text-gray-700">
                        💡 <strong>配置建議：</strong><br/>
                        • 健康險：60% ({userProfile.income ? Math.round(parseInt(userProfile.income) * 0.09) : 4500} 元)<br/>
                        • 意外險：20% ({userProfile.income ? Math.round(parseInt(userProfile.income) * 0.03) : 1500} 元)<br/>
                        • 壽險：20% ({userProfile.income ? Math.round(parseInt(userProfile.income) * 0.03) : 1500} 元)
                      </div>
                    </div>
                  </div>
                </div>

                {/* 投資規劃 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">投資理財規劃</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">建議投資金額</span>
                      <span className="font-semibold text-purple-600">
                        {userProfile.income ? `NT$ ${Math.round(parseInt(userProfile.income) * 0.25).toLocaleString()}` : 'NT$ 12,500'} / 月
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      約佔收入 25% 的投資理財
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-sm text-gray-700">
                        💡 <strong>投資建議：</strong><br/>
                        • 定期定額基金：70%<br/>
                        • 股票投資：20%<br/>
                        • 債券或定存：10%
                      </div>
                    </div>
                  </div>
                </div>

                {/* 退休規劃 */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Briefcase className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">退休準備規劃</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">退休目標金額</span>
                      <span className="font-semibold text-yellow-600">
                        NT$ 20,000,000
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      以 65 歲退休，需準備約 2000 萬元
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-sm text-gray-700">
                        💡 <strong>退休策略：</strong><br/>
                        • 勞保 + 勞退：基本保障<br/>
                        • 個人退休帳戶：每月 {userProfile.income ? Math.round(parseInt(userProfile.income) * 0.1) : 5000} 元<br/>
                        • 投資型保險：長期累積
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 整體財務健康度 */}
              <div className="mt-8 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">您的財務健康度評分</h3>
                
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { name: '緊急基金', score: userProfile.income ? 75 : 50, color: 'green' },
                    { name: '保險保障', score: recommendations.length > 0 ? 85 : 60, color: 'blue' },
                    { name: '投資理財', score: 70, color: 'purple' },
                    { name: '退休準備', score: userProfile.age && parseInt(userProfile.age) > 30 ? 65 : 45, color: 'yellow' }
                  ].map(item => (
                    <div key={item.name} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full border-4 border-gray-300 flex items-center justify-center bg-gray-50">
                        <span className="text-lg font-bold text-gray-600">{item.score}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.score}分</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      整體財務健康度：{Math.round((75 + (recommendations.length > 0 ? 85 : 60) + 70 + (userProfile.age && parseInt(userProfile.age) > 30 ? 65 : 45)) / 4)} 分
                    </span>
                  </div>
                </div>
              </div>

              {/* 行動建議 */}
              <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">🎯 立即行動建議</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">短期目標 (1-3個月)</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 建立緊急基金帳戶</li>
                      <li>• 購買基礎健康險</li>
                      <li>• 開始記帳追蹤支出</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">長期目標 (1-5年)</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 完成完整保險規劃</li>
                      <li>• 建立投資組合</li>
                      <li>• 規劃退休準備策略</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceAISystem;