# Dify 工作流与智能体搭建指南

## 一、Dify 服务搭建

### 1.1 环境要求
- 操作系统：Linux（推荐 CentOS 7+ / Ubuntu 18.04+）
- 内存：最低 4GB，推荐 8GB+
- 存储：最低 30GB
- Docker & Docker Compose

### 1.2 启动服务
```bash
# 进入Dify目录
cd /opt/dify

# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

默认访问地址：`http://localhost`
默认账号：`qst@qst.com` / `qst123456`

## 二、模型配置

### 2.1 DeepSeek 大模型配置

1. 点击右上角头像 → 设置 → 模型供应商
2. 选择"深度求索" → 点击设置
3. 输入 API Key：`sk-xxxxxxxxxxxxxxxxxxxxxxxx`
4. 点击保存

配置完成后，系统自动加载以下模型：
- `deepseek-v4-pro`：旗舰版，用于复杂推理和规划
- `deepseek-v4-flash`：轻量版，用于快速对话和代码生成

### 2.2 Embedding 模型配置

使用 Ollama 部署的本地 Embedding 模型：

1. 模型供应商 → Ollama → 添加模型
2. 配置参数：
   - 模型名称：`embeddinggemma:300m-qat-q4_0`
   - 模型类型：Text Embedding
   - 基础 URL：`http://虚拟机IP:11434`
3. 点击保存

## 三、知识库搭建

### 3.1 创建糖尿病医学知识库

1. 进入"知识库" → 创建知识库
2. 知识库名称：`糖尿病医学知识库`
3. 上传文档：
   - 《中国2型糖尿病防治指南》
   - 糖尿病饮食管理手册
   - 糖尿病运动指导手册
   - 糖尿病并发症防治指南
   - 糖尿病用药参考手册

4. 分段设置：
   - 分段方式：自动分段
   - 分段最大长度：1000
   - 分段重叠：100
   - 清洗规则：去除多余空行、替换连续空格

5. 索引方式：高质量（使用 Embedding 模型）
6. 点击"保存并处理"

### 3.2 知识库检索设置

- 检索模式：混合检索（语义检索 + 关键词检索）
-  top K：5
- 分数阈值：0.5
- 重排序：开启（使用 Rerank 模型）

## 四、工作流搭建

### 4.1 糖尿病风险预测工作流

**工作流名称**：`diabetes-risk-prediction`

**输入变量**：
- `age` (number)：年龄
- `gender` (string)：性别
- `height` (number)：身高(cm)
- `weight` (number)：体重(kg)
- `bmi` (number)：BMI指数
- `family_history` (string)：家族史
- `blood_pressure` (string)：血压状况
- `exercise` (string)：运动频率
- `diet` (string)：饮食习惯
- `smoking` (string)：吸烟情况

**节点编排**：

1. **开始节点**：接收上述输入变量

2. **代码节点 - BMI计算与风险评分**
```javascript
function main({age, bmi, family_history, blood_pressure, exercise, diet, smoking}) {
  let score = 0;
  if (age >= 45) score += 20;
  else if (age >= 35) score += 10;
  if (bmi >= 28) score += 25;
  else if (bmi >= 24) score += 15;
  if (family_history === 'yes') score += 20;
  if (blood_pressure === 'high') score += 15;
  if (exercise === 'rare') score += 15;
  if (diet === 'unhealthy') score += 10;
  if (smoking === 'yes') score += 5;
  
  let level = score < 20 ? '低风险' : score < 50 ? '中风险' : '高风险';
  return { risk_score: score, risk_level: level };
}
```

3. **知识库检索节点**：
   - 知识库：糖尿病医学知识库
   - 查询词：`糖尿病 {risk_level} 预防 干预措施`
   - top K：3

4. **LLM节点 - 风险分析报告生成**：
   - 模型：deepseek-v4-flash
   - 系统提示词：
   ```
   你是一位专业的糖尿病风险评估专家。请根据用户的健康数据和风险评分，生成一份详细的风险评估报告。
   
   要求：
   1. 分析用户的主要风险因素
   2. 给出针对性的健康建议
   3. 建议是否需要就医检查
   4. 语言通俗易懂，避免过多专业术语
   5. 参考检索到的医学知识
   
   用户数据：{{#开始.age#}}岁，BMI {{#开始.bmi#}}
   风险评分：{{#代码节点.risk_score#}}，风险等级：{{#代码节点.risk_level#}}
   医学参考：{{#知识库检索.text#}}
   ```

5. **结束节点**：输出 `risk_score`、`risk_level`、`report`

### 4.2 生活方案定制工作流

**工作流名称**：`life-plan-generator`

**输入变量**：
- `age`、`gender`、`bmi`、`risk_level`、`diet_preference`、`exercise_level`

**节点编排**：

1. **开始节点**

2. **知识库检索**：检索糖尿病饮食、运动相关知识

3. **LLM节点 - 饮食方案生成**：
   - 提示词：根据用户情况生成一日三餐+加餐的详细食谱，包含热量估算和营养成分

4. **LLM节点 - 运动方案生成**：
   - 提示词：生成有氧运动、力量训练、柔韧性训练的具体方案，包含频率、强度、时长

5. **LLM节点 - 监测方案生成**：
   - 提示词：生成血糖监测、体重监测、血压监测的频率和目标值

6. **结束节点**：整合输出饮食、运动、监测方案

### 4.3 健康资讯生成工作流

**工作流名称**：`health-news-generator`

**输入变量**：
- `topic` (string)：资讯主题
- `category` (string)：分类

**节点编排**：

1. **开始节点**

2. **知识库检索**：检索相关医学知识

3. **LLM节点 - 文章生成**：
   - 模型：deepseek-v4-flash
   - 提示词：生成一篇500-800字的糖尿病健康科普文章，结构包括引言、核心要点、实践建议、注意事项

4. **结束节点**：输出文章标题、摘要、正文

### 4.4 打卡数据分析工作流

**工作流名称**：`checkin-analysis`

**输入变量**：
- `checkin_data` (string)：打卡数据JSON

**节点编排**：

1. **开始节点**

2. **代码节点 - 数据统计**：计算平均血糖、运动达标率、健康饮食天数等

3. **LLM节点 - 分析报告**：根据统计数据生成健康评分和改进建议

4. **结束节点**

## 五、智能体搭建

### 5.1 糖尿病智能助手（Agent）

**应用名称**：`糖尿病智能助手`
**应用类型**：Agent

**配置**：
- 模型：deepseek-v4-pro
- 温度：0.7
- 最大回复：4096 token

**系统提示词**：
```
你是一位专业的糖尿病健康管理助手，拥有丰富的糖尿病防治知识。

你的能力包括：
1. 解答糖尿病相关知识问题
2. 帮助用户评估糖尿病风险
3. 提供个性化饮食和运动建议
4. 指导血糖监测和用药注意事项
5. 解释糖尿病并发症及预防方法

对话原则：
- 专业严谨，所有建议基于临床指南
- 通俗易懂，避免堆砌专业术语
- 主动询问用户基本信息，提供个性化建议
- 明确提示不能替代专业医疗诊断
- 关注用户心理状态，给予鼓励和支持

工具调用：
- 需要风险评估时，调用"糖尿病风险预测工作流"
- 需要生成方案时，调用"生活方案定制工作流"
- 需要医学知识时，检索"糖尿病医学知识库"
```

**关联工具**：
- 工作流：糖尿病风险预测、生活方案定制
- 知识库：糖尿病医学知识库
- 内置工具：谷歌搜索（可选）

**开场白**：
```
您好！我是糖尿病智能助手 🩺

我可以帮您：
📊 评估糖尿病风险
🥗 制定个性化饮食方案
🏃 提供科学运动指导
💬 解答糖尿病相关问题
🩸 指导血糖监测

请问有什么可以帮您的？
```

### 5.2 医师聊天助手

**应用名称**：`医师在线咨询`
**应用类型**：Chatflow

**配置**：
- 模型：deepseek-v4-flash
- 关联知识库：糖尿病医学知识库
- 提示词：设定为特定科室的医师角色

### 5.3 AI管理助手（Agent）

**应用名称**：`AI管理助手`
**应用类型**：Agent

**功能**：
- 分析用户数据和运营指标
- 自动生成运营报告
- 管理健康资讯内容
- 回答管理员关于系统运行的问题

## 六、API 调用配置

### 6.1 获取 API Key

在 Dify 应用页面 → 访问 API → 创建 API Key

### 6.2 前端配置

修改 `js/common.js` 中的配置：

```javascript
const CONFIG = {
  DIFY_API_BASE: 'http://你的Dify地址/v1',
  DIFY_API_KEY: 'app-你的应用APIKey',
  // ...
};
```

### 6.3 调用示例

**聊天消息**：
```javascript
const response = await fetch(`${CONFIG.DIFY_API_BASE}/chat-messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CONFIG.DIFY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: {},
    query: '用户问题',
    response_mode: 'blocking',
    user: 'user_id'
  })
});
```

**工作流执行**：
```javascript
const response = await fetch(`${CONFIG.DIFY_API_BASE}/workflows/run`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CONFIG.DIFY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: { age: 45, bmi: 26.5 },
    response_mode: 'blocking',
    user: 'user_id'
  })
});
```

## 七、调试与优化

1. **日志查看**：Dify 提供完整的对话日志和工作流执行日志
2. **标注优化**：对不满意的回答进行标注，持续优化提示词
3. **知识库更新**：定期更新医学知识库内容
4. **性能监控**：关注 API 响应时间和 token 消耗
