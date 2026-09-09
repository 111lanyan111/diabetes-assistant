# 糖尿病预治智能助手

基于 DeepSeek + Dify 智能体开发的糖尿病预治管理平台（支持本地Ollama模型部署 + Flask后端 + SQLite数据库）

## 项目简介

"糖尿病预治智能助手"创新性地融合了 DeepSeek 和 Dify 的前沿智能体开发技术，构建了一个一站式的糖尿病预治管理体系。通过深度对接专业医学知识库，运用 DeepSeek 大模型对用户健康数据进行全方位分析，精准预测糖尿病风险，并根据用户具体状况量身定制个性化防治方案。

项目支持两种AI部署模式：
- **云端模式**：基于Dify平台 + DeepSeek API，适合生产环境
- **本地模式**：基于Ollama + deepseek-r1本地模型，无需联网，保护隐私

## 技术栈

- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **后端**：Python Flask + Flask-CORS
- **数据库**：SQLite3（4张表）
- **数据可视化**：Chart.js 4.4（折线图、饼图、柱状图、雷达图）
- **AI大模型**：DeepSeek V4 Pro / Flash（云端）/ deepseek-r1（本地Ollama）
- **LLM应用平台**：Dify（知识库、工作流、智能体）
- **本地AI推理**：Ollama（支持流式输出、打字机效果）
- **响应式设计**：移动端适配（平板/手机/小屏手机）
- **内网穿透**：cpolar（支持公网访问）
- **开发工具**：VSCode + Cline 插件
- **测试框架**：Playwright

## 功能模块

| 模块 | 页面 | 功能说明 |
|------|------|----------|
| 首页 | index.html | 轮播图、功能入口、数据统计展示、科普信息、健康资讯 |
| 登录注册 | login.html | 用户登录（后端API对接）、注册、密码管理 |
| 个人中心 | profile.html | 个人信息管理、风险评估、评估记录、收藏管理 |
| 风险预测 | risk.html | 三步式AI糖尿病风险评估、可视化结果展示、AI详细报告 |
| 医师咨询 | doctor.html | 在线医师列表、AI模拟医师对话、快捷问题 |
| 生活方案 | plan.html | AI生成饮食方案、运动方案、监测方案、健康贴士 |
| 健康资讯 | news.html | 资讯列表、分类筛选、文章详情、AI生成资讯 |
| 健康打卡 | checkin.html | 每日打卡、打卡日历、AI智能分析、历史记录 |
| 智能助手 | ai.html | AI对话、流式打字机输出、Markdown渲染、历史对话、多轮对话 |
| 智能管理 | admin.html | 数据概览、用户管理（CRUD）、资讯管理、AI配置、系统日志、AI管理助手 |
| **数据统计** | **statistics.html** | **血糖趋势图、达标分布饼图、体重趋势、运动统计、饮食雷达图、AI数据分析** |
| **用药管理** | **medication.html** | **用药计划、提醒时间、服药打卡、依从性统计、用药记录、AI用药咨询** |
| **健康报告** | **report.html** | **周/月健康报告、综合评分、血糖统计、用药依从性、AI分析建议、打印导出PDF** |

## 扩展功能

### 核心扩展模块
- **📈 健康数据可视化统计**：5种图表（折线图、饼图、柱状图、雷达图），支持近7/14/30天数据切换，AI智能数据分析
- **💊 用药提醒与依从性管理**：用药计划管理、定时提醒、服药打卡、依从率统计、AI用药咨询
- **📋 健康报告生成与导出**：一键生成周/月健康报告，6大分析模块，综合健康评分，支持打印/导出PDF

### 后端与数据库
- **Flask后端API**：8个RESTful API（用户CRUD、登录、健康记录、统计概览、用户增长、功能使用分布）
- **SQLite数据库**：4张表（users、health_records、medications、risk_assessments）
- **用户管理后台**：管理员可增删改查用户，支持分页、搜索、启用/禁用
- **数据统计功能**：首页和管理后台统计数据均来自数据库
- **测试数据**：内置管理员账户和测试用户，方便演示和开发
- **密码加密**：MD5加密存储，参数化查询防SQL注入

### AI智能增强
- **AI健康资讯自动生成**：基于大模型自动生成健康科普文章
- **打卡数据AI分析**：智能分析用户打卡数据，提供个性化改进建议
- **管理员AI助手**：后台管理智能对话，自动生成运营报告，支持Markdown渲染
- **风险评估AI详细报告**：AI生成个性化风险评估与健康建议
- **AI用药咨询**：智能解答用药问题，药物相互作用咨询

### 体验优化
- **流式打字机输出**：AI回复逐字显示，带闪烁光标，类似主流AI对话体验
- **Markdown实时渲染**：标题、粗体、列表、代码块等格式实时渲染
- **对话历史管理**：智能助手支持多轮对话历史保存和加载
- **风险评估可视化**：仪表盘式风险结果展示
- **移动端响应式适配**：支持平板、手机、小屏手机，汉堡菜单导航

### 公网部署
- **cpolar内网穿透**：支持公网访问，无需云服务器
- **前端公网地址**：http://5cf9f0c9.r9.cpolar.top
- **后端公网API**：http://32331c2b.r9.cpolar.top/api
- **桌面一键启动/关闭脚本**：双击即可启动/关闭所有服务

## 项目结构

```
diabetesAssistant/
├── index.html          # 首页（数据统计展示）
├── login.html          # 登录注册（后端API对接）
├── profile.html        # 个人中心
├── risk.html           # 糖尿病风险预测
├── doctor.html         # 医师咨询
├── plan.html           # 生活方案
├── news.html           # 健康资讯
├── checkin.html        # 健康打卡
├── ai.html             # 智能助手（流式输出+Markdown渲染）
├── admin.html          # 智能管理（数据概览+用户CRUD+移动端适配）
├── statistics.html     # 数据统计（Chart.js可视化）
├── medication.html     # 用药管理（提醒+依从性）
├── report.html         # 健康报告（生成+导出PDF）
├── css/
│   └── style.css       # 全局样式（含响应式设计）
├── js/
│   └── common.js       # 公共工具库（Ollama/Dify双模式+移动端菜单）
├── backend/
│   ├── app.py          # Flask后端API（8个接口）
│   └── diabetes.db     # SQLite数据库
├── scripts/            # 一键启动/关闭脚本
│   ├── 启动所有服务.bat  # 一键启动Ollama+后端+前端
│   └── 关闭所有服务.bat  # 一键关闭所有服务
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
│   ├── 04-2-用户使用说明书.docx
│   ├── 05-个人项目总结报告.docx
│   └── 06-项目成果物提交内容.docx
├── package.json        # 项目配置
├── playwright.config.js # 测试配置
├── README.md           # 项目说明
└── .gitignore          # Git忽略配置
```

## 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+（运行测试时需要）
- Ollama（本地AI模式需要）

### 本地模式（推荐，无需联网）

#### 方式一：一键启动脚本（最简单）

```bash
# 双击运行 scripts/启动所有服务.bat
# 自动启动 Ollama + 后端Flask + 前端HTTP服务器 + 打开浏览器
# 关闭服务运行 scripts/关闭所有服务.bat
```

#### 方式二：手动启动

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

#### 3. 启动后端服务
```bash
cd diabetesAssistant/backend
pip install flask flask-cors
python app.py
# 后端运行在 http://localhost:5000
```

#### 4. 启动前端HTTP服务器
```bash
cd diabetesAssistant
python -m http.server 8081
# 前端运行在 http://localhost:8081
```

#### 5. 访问项目
```
http://localhost:8081/index.html
```

### 一键启动（Windows）

双击桌面 `启动所有服务.bat`，自动启动Ollama + 后端Flask + 前端HTTP服务器 + 打开浏览器。

双击桌面 `关闭所有服务.bat`，一键关闭所有服务。

### 默认账户

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 可访问管理后台，管理用户 |
| 普通用户 | testuser | 123456 | 普通用户，可体验所有功能 |

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

### 公网访问（cpolar内网穿透）

```bash
# 安装cpolar：https://www.cpolar.com/
# 映射前端
cpolar http 8081
# 映射后端
cpolar http 5000
# 获得公网地址后，修改前端API地址为后端公网地址
```

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

## API接口说明

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/users | GET | 获取用户列表（分页、搜索） |
| /api/users | POST | 注册新用户 |
| /api/users/:id | GET | 获取用户详情 |
| /api/users/:id | PUT | 更新用户信息 |
| /api/users/:id | DELETE | 删除用户（admin不可删除） |
| /api/login | POST | 用户登录 |
| /api/stats/overview | GET | 统计概览（总用户、评估数、记录数、活跃用户） |
| /api/stats/user-growth | GET | 用户增长趋势（近7天） |
| /api/stats/feature-usage | GET | 功能使用分布 |

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

## 移动端适配

项目已完成响应式设计，支持：
- **平板（1024px）**：4列网格变2列
- **手机（768px）**：所有网格变单列，汉堡菜单导航，表格横向滚动
- **小屏手机（480px）**：进一步优化字体和间距
- **安全区域适配**：支持iPhone刘海屏

## GitHub仓库

https://github.com/111lanyan111/diabetes-assistant

## 注意事项

- 本平台提供的健康建议仅供参考，不能替代专业医疗诊断
- 用户数据存储在SQLite数据库中，生产环境建议使用MySQL/PostgreSQL
- 本地Ollama模式首次推理可能需要30-60秒，后续会加快
- 健康报告导出PDF使用浏览器打印功能，建议使用Chrome/Edge浏览器
- 用药提醒功能需要浏览器通知权限，首次使用请允许通知
- cpolar免费版公网地址每次重启会变化，长期使用建议升级付费版或使用云服务器
- 管理员账户admin不可删除，防止误操作
