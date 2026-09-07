# 糖尿病预治智能助手

基于 DeepSeek + Dify 智能体开发的糖尿病预治管理平台（支持本地Ollama模型部署）

## 项目简介

"糖尿病预治智能助手"创新性地融合了 DeepSeek 和 Dify 的前沿智能体开发技术，构建了一个一站式的糖尿病预治管理体系。通过深度对接专业医学知识库，运用 DeepSeek 大模型对用户健康数据进行全方位分析，精准预测糖尿病风险，并根据用户具体状况量身定制个性化防治方案。

项目支持两种AI部署模式：
- **云端模式**：基于Dify平台 + DeepSeek API，适合生产环境
- **本地模式**：基于Ollama + deepseek-r1本地模型，无需联网，保护隐私

## 技术栈

- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **数据可视化**：Chart.js 4.4（折线图、饼图、柱状图、雷达图）
- **AI大模型**：DeepSeek V4 Pro / Flash（云端）/ deepseek-r1（本地Ollama）
- **LLM应用平台**：Dify（知识库、工作流、智能体）
- **本地AI推理**：Ollama（支持流式输出、打字机效果）
- **开发工具**：VSCode + Cline 插件
- **测试框架**：Playwright
- **部署**：Nginx / Python HTTP Server

## 功能模块

| 模块 | 页面 | 功能说明 |
|------|------|----------|
| 首页 | index.html | 轮播图、功能入口、统计数据、科普信息、健康资讯 |
| 登录注册 | login.html | 用户登录、注册、密码管理 |
| 个人中心 | profile.html | 个人信息管理、风险评估、评估记录、收藏管理 |
| 风险预测 | risk.html | 三步式AI糖尿病风险评估、可视化结果展示、AI详细报告 |
| 医师咨询 | doctor.html | 在线医师列表、AI模拟医师对话、快捷问题 |
| 生活方案 | plan.html | AI生成饮食方案、运动方案、监测方案、健康贴士 |
| 健康资讯 | news.html | 资讯列表、分类筛选、文章详情、AI生成资讯 |
| 健康打卡 | checkin.html | 每日打卡、打卡日历、AI智能分析、历史记录 |
| 智能助手 | ai.html | AI对话、流式打字机输出、Markdown渲染、历史对话、多轮对话 |
| 智能管理 | admin.html | 数据概览、用户管理、资讯管理、AI配置、系统日志、AI管理助手 |
| **数据统计** | **statistics.html** | **血糖趋势图、达标分布饼图、体重趋势、运动统计、饮食雷达图、AI数据分析** |
| **用药管理** | **medication.html** | **用药计划、提醒时间、服药打卡、依从性统计、用药记录、AI用药咨询** |
| **健康报告** | **report.html** | **周/月健康报告、综合评分、血糖统计、用药依从性、AI分析建议、打印导出PDF** |

## 扩展功能（80-89分）

### 核心扩展模块
- **📈 健康数据可视化统计**：5种图表（折线图、饼图、柱状图、雷达图），支持近7/14/30天数据切换，AI智能数据分析
- **💊 用药提醒与依从性管理**：用药计划管理、定时提醒、服药打卡、依从率统计、AI用药咨询
- **📋 健康报告生成与导出**：一键生成周/月健康报告，6大分析模块，综合健康评分，支持打印/导出PDF

### AI智能增强
- **AI健康资讯自动生成**：基于大模型自动生成健康科普文章
- **打卡数据AI分析**：智能分析用户打卡数据，提供个性化改进建议
- **管理员AI助手**：后台管理智能对话，自动生成运营报告
- **风险评估AI详细报告**：AI生成个性化风险评估与健康建议
- **AI用药咨询**：智能解答用药问题，药物相互作用咨询

### 体验优化
- **流式打字机输出**：AI回复逐字显示，带闪烁光标，类似主流AI对话体验
- **Markdown实时渲染**：标题、粗体、列表、代码块等格式实时渲染
- **对话历史管理**：智能助手支持多轮对话历史保存和加载
- **风险评估可视化**：仪表盘式风险结果展示

## 项目结构

```
diabetesAssistant/
├── index.html          # 首页
├── login.html          # 登录注册
├── profile.html        # 个人中心
├── risk.html           # 糖尿病风险预测
├── doctor.html         # 医师咨询
├── plan.html           # 生活方案
├── news.html           # 健康资讯
├── checkin.html        # 健康打卡
├── ai.html             # 智能助手（流式输出+Markdown渲染）
├── admin.html          # 智能管理
├── statistics.html     # 数据统计（Chart.js可视化）
├── medication.html     # 用药管理（提醒+依从性）
├── report.html         # 健康报告（生成+导出PDF）
├── css/
│   └── style.css       # 全局样式
├── js/
│   └── common.js       # 公共工具库（支持Ollama/Dify双模式）
├── tests/              # Playwright测试脚本
│   ├── index.spec.js
│   ├── login.spec.js
│   ├── risk.spec.js
│   ├── doctor.spec.js
│   ├── checkin.spec.js
│   └── ai.spec.js
├── docs/               # 项目文档
│   ├── dify-workflow-guide.md
│   ├── 01-软件需求分析规格说明书.docx
│   ├── 03-专业综合实训报告书.docx
│   ├── 04-1-运行部署技术文档.docx
│   └── 04-2-用户使用说明书.docx
├── package.json        # 项目配置
├── playwright.config.js # 测试配置
└── .gitignore          # Git忽略配置
```

## 快速开始

### 本地模式（推荐，无需联网）

#### 1. 安装Ollama并下载模型
```bash
# 下载安装Ollama：https://ollama.com/
# 拉取deepseek-r1模型
ollama pull deepseek-r1
```

#### 2. 启动Ollama服务
```bash
# Windows：双击 ollama app.exe
# 或命令行启动
ollama serve
```

#### 3. 启动HTTP服务器
```bash
cd diabetesAssistant
python -m http.server 8080
```

#### 4. 访问项目
```
http://localhost:8080/index.html
```

### 一键启动（Windows）

双击桌面 `启动糖尿病助手.bat`，自动启动Ollama + HTTP服务器 + 打开浏览器。

### 云端模式（Dify + DeepSeek API）

1. 启动Dify服务（本地虚拟机或云沙箱）
2. 配置DeepSeek模型API Key
3. 配置Embedding模型
4. 创建以下应用：
   - 糖尿病风险预测工作流
   - 生活方案定制工作流
   - 健康资讯生成工作流
   - 医师聊天助手
   - 糖尿病智能助手（Agent）
   - AI管理助手（Agent）
5. 在 `js/common.js` 中配置API地址和Key

### 运行测试

```bash
# 安装依赖
npm install

# 安装Playwright浏览器
npx playwright install

# 运行测试
npm test

# 查看测试报告
npm run test:report
```

## AI配置说明

### 本地Ollama模式（默认）

`js/common.js` 中的配置：
```javascript
const CONFIG = {
  OLLAMA_API_BASE: 'http://localhost:11434/api',
  OLLAMA_MODEL: 'deepseek-r1:latest',
  // ...
};
```

### 云端Dify模式

修改 `js/common.js` 中的DifyAPI配置，将API地址和Key填入CONFIG。

## Dify工作流说明

详见 `docs/dify-workflow-guide.md`

## 部署说明

详见 `docs/04-1-运行部署技术文档.docx`

## 注意事项

- 本平台提供的健康建议仅供参考，不能替代专业医疗诊断
- 用户数据存储在本地浏览器（localStorage），生产环境需接入后端数据库
- 本地Ollama模式首次推理可能需要30-60秒，后续会加快
- 健康报告导出PDF使用浏览器打印功能，建议使用Chrome/Edge浏览器
- 用药提醒功能需要浏览器通知权限，首次使用请允许通知
