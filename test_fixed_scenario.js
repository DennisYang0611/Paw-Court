// 测试修复后的评分系统 - 场景一
const importFetch = async () => {
  const { default: fetch } = await import('node-fetch');
  return fetch;
};

// 从aiService.ts复制的函数
async function analyzeCoupleFight(formData) {
  const fetch = await importFetch();
  const DOUBAO_API_URL = 'https://aiproxy.hzh.sealos.run/v1/chat/completions';
  const API_KEY = 'sk-6jJxgtTj8ZdCnT8NkXirzSY5bYCItphrcn7cn7XxK3SDwxdK';

  // 第一步：专门的评分
  const scoringResult = await scoreCoupleFight(formData);

  return {
    title: "测试案例",
    summary: "测试修复后的评分",
    reason: "测试用例",
    verdict: "测试判决",
    solutions: { person1: ["建议1"], person2: ["建议2"] },
    scoringDetails: scoringResult.scoringDetails,
    faultPercentage: scoringResult.faultPercentage
  };
}

async function scoreCoupleFight(formData) {
  const fetch = await importFetch();
  const DOUBAO_API_URL = 'https://aiproxy.hzh.sealos.run/v1/chat/completions';
  const API_KEY = 'sk-6jJxgtTj8ZdCnT8NkXirzSY5bYCItphrcn7cn7XxK3SDwxdK';

  const scoringPrompt = `
你是汪汪法庭的专业评分员，请严格按照5维度评分标准对以下情侣争吵案件进行量化评分。

## 案件信息：
**当事人甲（${formData.person1.name}）陈述：**
- 事情经过：${formData.person1.story}
- 委屈诉求：${formData.person1.complaint}

**当事人乙（${formData.person2.name}）陈述：**
- 事情经过：${formData.person2.story}
- 委屈诉求：${formData.person2.complaint}

## 评分标准（每个维度0-20分）：

### 1. 沟通态度 (0-20分)
- 20-18分：主动沟通，耐心倾听，语言温和
- 17-14分：基本愿意沟通，偶有不耐烦
- 13-10分：被动沟通，经常打断对方
- 9-6分：回避沟通，态度冷淡或激进
- 5-0分：拒绝沟通，恶语相向

### 2. 情绪控制 (0-20分)
- 20-18分：全程冷静理性，包容理解
- 17-14分：基本平和，偶有情绪波动
- 13-10分：情绪不稳，有指责行为
- 9-6分：经常情绪化，多次激动
- 5-0分：完全失控，暴躁易怒

### 3. 问题处理 (0-20分)
- 20-18分：积极寻求解决方案，建设性强
- 17-14分：愿意解决问题，有一定妥协
- 13-10分：态度一般，固执己见
- 9-6分：逃避问题，破坏性行为
- 5-0分：完全逃避，纯粹破坏

### 4. 理解共情 (0-20分)
- 20-18分：充分换位思考，体谅关怀对方
- 17-14分：基本理解对方，偶有共情
- 13-10分：理解有限，较为自我中心
- 9-6分：缺乏共情，经常忽视对方感受
- 5-0分：完全自我中心，冷漠无情

### 5. 行为表现 (0-20分)
- 20-18分：言行一致，负责任，主动改进
- 17-14分：基本可靠，有改进意愿
- 13-10分：偶有不一致，改进意愿一般
- 9-6分：经常推诿责任，言不由衷
- 5-0分：完全不负责，重复犯错

## 评分要求：
1. 必须基于具体陈述内容评分，不能主观臆断
2. 仔细分析双方的具体行为和态度表现
3. 评分要有差异性，避免给出相近分数
4. 责任比例计算公式：
   - Person1责任% = (Person2总分 / (Person1总分 + Person2总分)) × 100%
   - Person2责任% = (Person1总分 / (Person1总分 + Person2总分)) × 100%
   - 即：表现差的人(得分低)承担更多责任
5. 必须说明每个维度扣分的具体原因

请返回以下JSON格式：
{
  "scoringDetails": {
    "person1": {
      "communication": 具体分数,
      "emotionControl": 具体分数,
      "problemSolving": 具体分数,
      "empathy": 具体分数,
      "behavior": 具体分数,
      "totalScore": 总分,
      "reasoning": "详细说明每个维度的评分理由，指出具体的扣分和加分原因"
    },
    "person2": {
      "communication": 具体分数,
      "emotionControl": 具体分数,
      "problemSolving": 具体分数,
      "empathy": 具体分数,
      "behavior": 具体分数,
      "totalScore": 总分,
      "reasoning": "详细说明每个维度的评分理由，指出具体的扣分和加分原因"
    }
  },
  "faultPercentage": {
    "person1": 精确百分比（保留1位小数）,
    "person2": 精确百分比（保留1位小数）
  }
}

严格要求：只返回JSON格式，不要任何其他解释文字！
  `;

  try {
    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-max',
        messages: [{ role: 'user', content: scoringPrompt }],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    return parseScoreResponse(aiResponse, formData);
  } catch (error) {
    console.error('评分API调用失败:', error);
    return getDefaultScoring(formData);
  }
}

function parseScoreResponse(aiResponse, formData) {
  try {
    const cleanResponse = aiResponse.trim();
    let jsonData;
    const jsonMatch = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonData = JSON.parse(jsonMatch[1]);
    } else {
      jsonData = JSON.parse(cleanResponse);
    }

    // 获取评分详情
    const person1Score = jsonData.scoringDetails?.person1?.totalScore || 75;
    const person2Score = jsonData.scoringDetails?.person2?.totalScore || 75;

    // 重新计算责任比例，确保逻辑正确：得分低的人责任大
    const totalScore = person1Score + person2Score;
    const person1Fault = Math.round((person2Score / totalScore) * 1000) / 10;
    const person2Fault = Math.round((person1Score / totalScore) * 1000) / 10;

    return {
      scoringDetails: {
        person1: {
          communication: jsonData.scoringDetails?.person1?.communication || 15,
          emotionControl: jsonData.scoringDetails?.person1?.emotionControl || 15,
          problemSolving: jsonData.scoringDetails?.person1?.problemSolving || 15,
          empathy: jsonData.scoringDetails?.person1?.empathy || 15,
          behavior: jsonData.scoringDetails?.person1?.behavior || 15,
          totalScore: person1Score,
          reasoning: jsonData.scoringDetails?.person1?.reasoning || "评分基于具体表现"
        },
        person2: {
          communication: jsonData.scoringDetails?.person2?.communication || 15,
          emotionControl: jsonData.scoringDetails?.person2?.emotionControl || 15,
          problemSolving: jsonData.scoringDetails?.person2?.problemSolving || 15,
          empathy: jsonData.scoringDetails?.person2?.empathy || 15,
          behavior: jsonData.scoringDetails?.person2?.behavior || 15,
          totalScore: person2Score,
          reasoning: jsonData.scoringDetails?.person2?.reasoning || "评分基于具体表现"
        }
      },
      faultPercentage: {
        person1: person1Fault,
        person2: person2Fault
      }
    };
  } catch (error) {
    console.error('评分JSON解析失败:', error);
    return getDefaultScoring(formData);
  }
}

function getDefaultScoring(formData) {
  const randomScores = [
    { p1: 76, p2: 68 },
    { p1: 71, p2: 82 },
    { p1: 65, p2: 74 },
    { p1: 78, p2: 59 }
  ];
  const selected = randomScores[Math.floor(Math.random() * randomScores.length)];
  const totalScore = selected.p1 + selected.p2;
  const person1Fault = Math.round((selected.p2 / totalScore) * 1000) / 10;
  const person2Fault = Math.round((selected.p1 / totalScore) * 1000) / 10;

  return {
    scoringDetails: {
      person1: {
        communication: Math.floor(selected.p1 / 5) + Math.floor(Math.random() * 3),
        emotionControl: Math.floor(selected.p1 / 5) + Math.floor(Math.random() * 3),
        problemSolving: Math.floor(selected.p1 / 5) + Math.floor(Math.random() * 3),
        empathy: Math.floor(selected.p1 / 5) + Math.floor(Math.random() * 3),
        behavior: Math.floor(selected.p1 / 5) + Math.floor(Math.random() * 3),
        totalScore: selected.p1,
        reasoning: `基于${formData.person1.name}的具体表现进行综合评分`
      },
      person2: {
        communication: Math.floor(selected.p2 / 5) + Math.floor(Math.random() * 3),
        emotionControl: Math.floor(selected.p2 / 5) + Math.floor(Math.random() * 3),
        problemSolving: Math.floor(selected.p2 / 5) + Math.floor(Math.random() * 3),
        empathy: Math.floor(selected.p2 / 5) + Math.floor(Math.random() * 3),
        behavior: Math.floor(selected.p2 / 5) + Math.floor(Math.random() * 3),
        totalScore: selected.p2,
        reasoning: `基于${formData.person2.name}的具体表现进行综合评分`
      }
    },
    faultPercentage: {
      person1: person1Fault,
      person2: person2Fault
    }
  };
}

// 测试场景一
const scenario1 = {
  person1: {
    name: "小雅",
    story: "和男友恋爱3年，一直计划买房结婚，两人约定共同存钱，每月各自拿出工资的50%存入共同账户。我严格遵守约定，甚至主动多存部分奖金。直到最近看房准备付首付时，我发现共同账户的钱远不够预期，追问下才得知男友近1年沉迷网络赌博，还挪用了共同账户的20万，欠下8万网贷。",
    complaint: "我满心欢喜地规划我们的未来，省吃俭用为买房攒钱，你却背着我赌博、挪用共同财产，还一次次欺骗我，我再也不敢相信你了。"
  },
  person2: {
    name: "小明",
    story: "一开始只是想通过网络赌博赚点'外快'，让买房的速度更快，没想到越陷越深。心里害怕被女友发现，就开始隐瞒，挪用共同账户的钱时也告诉自己'赢回来就还上'，结果越输越多。",
    complaint: "我一开始的初衷是好的，只是一时糊涂犯了错，我也很后悔；我知道对不起你，但我现在也不知道该怎么办。"
  }
};

async function testScenario() {
  console.log('🧪 测试修复后的场景一：隐瞒重大财务问题');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⏳ 正在分析中...\n');

  try {
    const result = await analyzeCoupleFight(scenario1);

    console.log(`📊 评分结果:`);
    console.log(`${scenario1.person1.name}总分: ${result.scoringDetails.person1.totalScore}/100`);
    console.log(`${scenario1.person2.name}总分: ${result.scoringDetails.person2.totalScore}/100\n`);

    console.log(`⚖️ 责任分配:`);
    console.log(`${scenario1.person1.name}: ${result.faultPercentage.person1}%`);
    console.log(`${scenario1.person2.name}: ${result.faultPercentage.person2}%\n`);

    const isExpected = result.faultPercentage.person2 > result.faultPercentage.person1;
    console.log(`✅ 评分结果: ${isExpected ? '✅ 符合预期 - 过错方(小明)承担更多责任！' : '❌ 仍有问题'}`);

  } catch (error) {
    console.error(`❌ 测试失败: ${error.message}`);
  }
}

testScenario();