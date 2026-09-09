// 糖尿病预治智能助手 - 公共JavaScript工具库

// ========== 配置 ==========
const CONFIG = {
  // Ollama本地模型配置（无需API Key）
  OLLAMA_API_BASE: 'http://localhost:11434/api',
  OLLAMA_MODEL: 'deepseek-r1:latest',
  
  // Dify API配置（保留备用，部署时替换为实际地址）
  DIFY_API_BASE: 'http://localhost/v1',
  DIFY_API_KEY: 'app-xxxxxxxxxxxxxxxxxxxxxxxx',
  
  // Express+SQLite后端配置
  BACKEND_API: 'http://localhost:3000/api',
  
  // 页面标题
  APP_NAME: '糖尿病预治智能助手'
};

// ========== 本地存储工具 ==========
const Storage = {
  get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  // 用户相关
  getCurrentUser() {
    return this.get('currentUser');
  },
  setCurrentUser(user) {
    this.set('currentUser', user);
  },
  logout() {
    this.remove('currentUser');
    this.remove('userProfile');
  },
  // 打卡记录
  getCheckins() {
    return this.get('checkins') || [];
  },
  addCheckin(record) {
    const list = this.getCheckins();
    record.id = Date.now();
    record.date = new Date().toISOString().split('T')[0];
    list.unshift(record);
    this.set('checkins', list);
    return record;
  },
  // 收藏
  getFavorites() {
    return this.get('favorites') || [];
  },
  toggleFavorite(article) {
    const list = this.getFavorites();
    const idx = list.findIndex(a => a.id === article.id);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(article);
    }
    this.set('favorites', list);
    return idx < 0;
  },
  isFavorite(id) {
    return this.getFavorites().some(a => a.id === id);
  }
};

// ========== AI API 调用（基于本地Ollama）==========
const DifyAPI = {
  // 发送聊天消息（使用本地Ollama模型，流式输出）
  async chatMessageStream(query, onToken, user = 'default_user', conversationId = '') {
    try {
      const response = await fetch(`${CONFIG.OLLAMA_API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: CONFIG.OLLAMA_MODEL,
          messages: [{ role: 'user', content: query }],
          stream: true
        })
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';
      let inThink = false;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message && data.message.content) {
              let token = data.message.content;
              // 处理思考标签
              if (token.includes('<think>')) {
                inThink = true;
                token = token.replace(/<think>[\s\S]*?<\/think>/g, '');
                if (token.includes('</think>')) {
                  inThink = false;
                  token = token.replace(/<\/think>/g, '');
                } else if (inThink) {
                  token = '';
                }
              } else if (inThink) {
                if (token.includes('</think>')) {
                  inThink = false;
                  token = token.replace(/<\/think>/g, '');
                } else {
                  token = '';
                }
              }
              if (token) {
                fullAnswer += token;
                if (onToken) onToken(token, fullAnswer);
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
      
      return {
        answer: fullAnswer.trim() || '抱歉，我无法回答这个问题。',
        conversationId: conversationId || Date.now().toString()
      };
    } catch (error) {
      console.error('Ollama stream chat error:', error);
      if (onToken) onToken('', '抱歉，AI服务暂时不可用。请确保Ollama已启动并下载了deepseek-r1模型。');
      return { answer: '抱歉，AI服务暂时不可用。请确保Ollama已启动并下载了deepseek-r1模型。', conversationId };
    }
  },

  // 发送聊天消息（阻塞模式，保留兼容）
  async chatMessage(query, user = 'default_user', conversationId = '') {
    return await this.chatMessageStream(query, null, user, conversationId);
  },

  // 运行工作流（使用本地Ollama模型生成）
  async runWorkflow(inputs, user = 'default_user') {
    try {
      // 构建提示词
      let prompt = '';
      if (inputs.type === 'risk_prediction') {
        prompt = `作为糖尿病健康管理专家，请根据以下用户健康数据进行风险评估：
年龄：${inputs.age}岁
性别：${inputs.gender}
身高：${inputs.height}cm
体重：${inputs.weight}kg
BMI：${inputs.bmi}
家族史：${inputs.familyHistory}
血压：${inputs.bloodPressure}
运动频率：${inputs.exercise}
饮食习惯：${inputs.diet}
吸烟：${inputs.smoking}
饮酒：${inputs.drinking}

请给出：1.风险评分（0-100分）2.风险等级（低/中/高）3.详细评估报告 4.饮食建议 5.运动建议 6.就医建议`;
      } else if (inputs.type === 'life_plan') {
        prompt = `作为糖尿病健康管理专家，请为以下用户制定个性化健康方案：
年龄：${inputs.age}岁，性别：${inputs.gender}，BMI：${inputs.bmi}
风险等级：${inputs.riskLevel}

请给出：1.详细饮食方案（早餐/午餐/晚餐/加餐）2.运动方案（有氧/力量/柔韧）3.血糖监测方案 4.健康贴士`;
      } else if (inputs.type === 'news_generate') {
        prompt = `作为健康科普作家，请写一篇关于"${inputs.topic}"的糖尿病健康科普文章，800字左右，结构清晰，通俗易懂。`;
      } else if (inputs.type === 'checkin_analysis') {
        prompt = `作为糖尿病健康管理专家，请分析用户最近${inputs.days}天的打卡数据：
平均空腹血糖：${inputs.avgFasting}mmol/L
平均餐后血糖：${inputs.avgPostprandial}mmol/L
平均体重：${inputs.avgWeight}kg
打卡天数：${inputs.checkinDays}天

请给出：1.健康评分（0-100）2.数据分析 3.改进建议 4.鼓励话语`;
      } else {
        prompt = JSON.stringify(inputs);
      }

      const response = await fetch(`${CONFIG.OLLAMA_API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: CONFIG.OLLAMA_MODEL,
          messages: [{ role: 'user', content: prompt }],
          stream: false
        })
      });
      const data = await response.json();
      let content = data.message?.content || '';
      content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      return { result: content };
    } catch (error) {
      console.error('Ollama workflow error:', error);
      return null;
    }
  },

  // 获取消息历史（本地存储）
  async getHistory(conversationId, user = 'default_user') {
    const history = Storage.get(`chat_history_${conversationId}`) || [];
    return { data: history };
  }
};

// ========== 模拟数据（无后端时使用）==========
const MockData = {
  // 模拟糖尿病风险预测
  predictRisk(profile) {
    let score = 0;
    if (profile.age >= 45) score += 20;
    else if (profile.age >= 35) score += 10;
    if (profile.bmi >= 28) score += 25;
    else if (profile.bmi >= 24) score += 15;
    if (profile.familyHistory === 'yes') score += 20;
    if (profile.bloodPressure === 'high') score += 15;
    if (profile.exercise === 'rare') score += 15;
    else if (profile.exercise === 'sometimes') score += 5;
    if (profile.diet === 'unhealthy') score += 10;
    
    let level, color, advice;
    if (score < 20) {
      level = '低风险'; color = 'green';
      advice = '您的糖尿病风险较低，请继续保持健康的生活方式，定期体检。';
    } else if (score < 50) {
      level = '中风险'; color = 'orange';
      advice = '您存在一定的糖尿病风险，建议控制饮食、增加运动、定期监测血糖。';
    } else {
      level = '高风险'; color = 'red';
      advice = '您的糖尿病风险较高，强烈建议尽快就医检查，严格控制饮食和体重，遵医嘱进行干预。';
    }
    return { score, level, color, advice };
  },

  // 模拟生活方案生成
  generatePlan(profile) {
    return {
      diet: {
        breakfast: '全麦面包2片 + 水煮蛋1个 + 无糖豆浆250ml + 凉拌黄瓜',
        lunch: '糙米饭100g + 清蒸鱼100g + 蒜蓉西兰花200g + 番茄蛋汤',
        dinner: '杂粮粥1碗 + 鸡胸肉80g + 炒时蔬200g',
        snacks: '上午：原味坚果15g；下午：苹果1个（约200g）',
        tips: ['控制总热量，每日约1600-1800千卡', '碳水化合物占比45-55%', '选择低GI食物，避免精制糖', '少食多餐，定时定量']
      },
      exercise: {
        aerobic: '快走或慢跑30分钟，每周5次，心率控制在（220-年龄）×60%-70%',
        strength: '哑铃或弹力带训练20分钟，每周3次，涵盖上肢、下肢、核心',
        flexibility: '瑜伽或拉伸10分钟，每日进行',
        tips: ['运动前后监测血糖', '避免空腹运动，随身携带糖果', '循序渐进，避免剧烈运动', '足部有病变者选择低冲击运动']
      },
      monitoring: {
        bloodGlucose: '空腹及餐后2小时各测一次，记录数值',
        weight: '每周固定时间称重一次',
        bloodPressure: '每周测量2-3次',
        tips: ['建立血糖监测日记', '异常值及时就医', '每3个月检查糖化血红蛋白']
      }
    };
  },

  // 健康资讯文章
  articles: [
    { id: 1, title: '糖尿病患者的饮食黄金法则', summary: '掌握这些饮食原则，让血糖平稳不再难。', category: '饮食管理', icon: '🥗', color: '#10b981', date: '2026-09-01', views: 1256,
      content: '糖尿病饮食管理是控制血糖的基石。本文详细介绍了碳水化合物计数法、低GI食物选择、餐次分配等核心原则...' },
    { id: 2, title: '科学运动：糖尿病患者的运动指南', summary: '什么样的运动最适合糖友？如何安全运动？', category: '运动指导', icon: '🏃', color: '#3b82f6', date: '2026-08-28', views: 987,
      content: '运动可以提高胰岛素敏感性，帮助控制血糖。本文介绍了有氧运动、力量训练的具体方案和注意事项...' },
    { id: 3, title: '认识1型和2型糖尿病的区别', summary: '不同类型的糖尿病，管理方式大不相同。', category: '疾病科普', icon: '📚', color: '#f59e0b', date: '2026-08-25', views: 2341,
      content: '1型糖尿病和2型糖尿病在发病机制、治疗方法上有本质区别。了解差异有助于个体化管理...' },
    { id: 4, title: '血糖监测的正确方法与时机', summary: '测血糖不是随便扎一下，这些细节很重要。', category: '监测指导', icon: '🩸', color: '#ef4444', date: '2026-08-20', views: 1567,
      content: '正确的血糖监测是糖尿病管理的重要环节。本文介绍了采血部位选择、监测频率、记录方法等...' },
    { id: 5, title: '糖尿病并发症的早期信号', summary: '出现这些症状要警惕，早发现早治疗。', category: '并发症', icon: '⚠️', color: '#8b5cf6', date: '2026-08-15', views: 1890,
      content: '糖尿病并发症包括视网膜病变、肾病、神经病变等。了解早期信号有助于及时干预...' },
    { id: 6, title: '胰岛素使用的常见误区', summary: '用胰岛素会上瘾？这些说法别再信了。', category: '用药指导', icon: '💉', color: '#06b6d4', date: '2026-08-10', views: 1123,
      content: '胰岛素是控制血糖的有效药物，但很多患者存在误解。本文澄清了关于胰岛素的常见误区...' }
  ],

  // 医师列表
  doctors: [
    { id: 1, name: '张明华', title: '主任医师', department: '内分泌科', hospital: '北京协和医院', experience: '25年', avatar: '👨‍⚕️',
      specialty: '糖尿病及并发症诊治、甲状腺疾病', rating: 4.9, online: true },
    { id: 2, name: '李雪芳', title: '副主任医师', department: '内分泌科', hospital: '上海瑞金医院', experience: '18年', avatar: '👩‍⚕️',
      specialty: '2型糖尿病管理、妊娠糖尿病', rating: 4.8, online: true },
    { id: 3, name: '王建国', title: '主任医师', department: '内分泌代谢科', hospital: '广州中山医院', experience: '22年', avatar: '👨‍⚕️',
      specialty: '糖尿病肾病、糖尿病足', rating: 4.9, online: false },
    { id: 4, name: '陈晓燕', title: '主治医师', department: '营养科', hospital: '华西医院', experience: '12年', avatar: '👩‍⚕️',
      specialty: '糖尿病医学营养治疗', rating: 4.7, online: true }
  ]
};

// ========== 通用工具函数 ==========
const Utils = {
  // 格式化日期
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes);
  },

  // 计算BMI
  calcBMI(height, weight) {
    const h = height / 100;
    return (weight / (h * h)).toFixed(1);
  },

  // BMI分类
  bmiCategory(bmi) {
    if (bmi < 18.5) return { label: '偏瘦', color: 'blue' };
    if (bmi < 24) return { label: '正常', color: 'green' };
    if (bmi < 28) return { label: '超重', color: 'orange' };
    return { label: '肥胖', color: 'red' };
  },

  // 显示提示消息
  toast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
      padding: 12px 24px; border-radius: 8px; color: white; font-size: 14px;
      font-weight: 500; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: opacity 0.3s, transform 0.3s; opacity: 0;
    `;
    const colors = { info: '#2563eb', success: '#10b981', warning: '#f59e0b', error: '#ef4444' };
    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // 检查登录状态
  requireLogin() {
    const user = Storage.getCurrentUser();
    if (!user) {
      this.toast('请先登录', 'warning');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return false;
    }
    return true;
  },

  // 渲染导航栏
  renderNav(activePage) {
    const user = Storage.getCurrentUser();
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    
    const links = [
      { href: 'index.html', label: '首页', icon: '🏠' },
      { href: 'risk.html', label: '风险预测', icon: '⚠️' },
      { href: 'doctor.html', label: '医师咨询', icon: '👨‍⚕️' },
      { href: 'statistics.html', label: '数据统计', icon: '📈' },
      { href: 'medication.html', label: '用药管理', icon: '💊' },
      { href: 'plan.html', label: '生活方案', icon: '📋' },
      { href: 'news.html', label: '健康资讯', icon: '📰' },
      { href: 'checkin.html', label: '健康打卡', icon: '✅' },
      { href: 'report.html', label: '健康报告', icon: '📋' },
      { href: 'ai.html', label: '智能助手', icon: '🤖' },
      { href: 'profile.html', label: '个人中心', icon: '👤' }
    ];

    nav.innerHTML = `
      <div class="logo">
        <div class="logo-icon">🩺</div>
        <span class="logo-text">${CONFIG.APP_NAME}</span>
      </div>
      <div class="nav-links">
        ${links.map(l => `<a href="${l.href}" class="${activePage === l.href ? 'active' : ''}">${l.icon} ${l.label}</a>`).join('')}
      </div>
      <button class="mobile-menu-btn" onclick="Utils.toggleMobileMenu()" style="display:none">☰</button>
      <div class="nav-user" onclick="window.location.href='profile.html'">
        ${user ? `
          <div class="nav-avatar">${user.username ? user.username.charAt(0).toUpperCase() : 'U'}</div>
          <span class="nav-username" style="font-size:14px">${user.username || '用户'}</span>
        ` : `
          <a href="login.html" class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:white">登录/注册</a>
        `}
      </div>
    `;
    
    // 添加移动端导航菜单
    let mobileNav = document.querySelector('.mobile-nav');
    if (!mobileNav) {
      mobileNav = document.createElement('div');
      mobileNav.className = 'mobile-nav';
      document.body.appendChild(mobileNav);
    }
    mobileNav.innerHTML = links.map(l => 
      `<a href="${l.href}" class="${activePage === l.href ? 'active' : ''}" onclick="Utils.toggleMobileMenu()">${l.icon} ${l.label}</a>`
    ).join('') + (user ? 
      `<a href="profile.html" onclick="Utils.toggleMobileMenu()">👤 个人中心</a><a href="#" onclick="Utils.logout();return false;">🚪 退出登录</a>` : 
      `<a href="login.html">🔑 登录/注册</a>`
    );
  },
  
  // 切换移动端菜单
  toggleMobileMenu() {
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
      mobileNav.classList.toggle('active');
    }
  },
  
  // 退出登录
  logout() {
    Storage.clearCurrentUser();
    window.location.href = 'login.html';
  },

  // 渲染页脚
  renderFooter() {
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.innerHTML = `
        <p>© 2026 ${CONFIG.APP_NAME} | 基于 DeepSeek + Dify 智能体技术构建</p>
        <p style="margin-top:8px;opacity:0.7">本平台提供的健康建议仅供参考，不能替代专业医疗诊断</p>
      `;
    }
  },

  // 初始化页面
  initPage(activePage) {
    this.renderNav(activePage);
    this.renderFooter();
  }
};

// 导出到全局
window.Storage = Storage;
window.DifyAPI = DifyAPI;
window.MockData = MockData;
window.Utils = Utils;
window.CONFIG = CONFIG;
