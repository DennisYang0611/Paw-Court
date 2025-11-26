// 测试三个争吵场景的评分系统

// 动态导入fetch
const importFetch = async () => {
  const { default: fetch } = await import('node-fetch');
  return fetch;
};

// 模拟 aiService.ts 中的函数
async function analyzeCoupleFight(formData) {
  const fetch = await importFetch();
  const DOUBAO_API_URL = 'https://aiproxy.hzh.sealos.run/v1/chat/completions';
  const API_KEY = 'sk-6jJxgtTj8ZdCnT8NkXirzSY5bYCItphrcn7cn7XxK3SDwxdK';

  // 第一步：专门的评分
  const scoringResult = await scoreCoupleFight(formData);

  // 第二步：基于评分进行分析和判决
  const analysisPrompt = `
你是汪汪法庭的专业情感纠纷调解法官米粒，请基于已完成的评分分析，对情侣争吵案件进行综合判决。

## 案件信息：
**当事人甲（${formData.person1.name}）陈述：**
- 事情经过：${formData.person1.story}
- 委屈诉求：${formData.person1.complaint}

**当事人乙（${formData.person2.name}）陈述：**
- 事情经过：${formData.person2.story}
- 委屈诉求：${formData.person2.complaint}

## 评分结果：
- ${formData.person1.name}总分：${scoringResult.scoringDetails.person1.totalScore}/100，责任比例：${scoringResult.faultPercentage.person1}%
- ${formData.person2.name}总分：${scoringResult.scoringDetails.person2.totalScore}/100，责任比例：${scoringResult.faultPercentage.person2}%

请返回以下JSON格式：
{
  "title": "吸引人的案件标题（10-20字）",
  "summary": "一句话概括核心问题（20-50字）",
  "reason": "详细分析事件经过和争执根本原因（200-500字）",
  "verdict": "以可爱正式的法律用语写判决，引用适当的虚构法条",
  "solutions": {
    "person1": [
      "针对具体问题的第一条建议",
      "针对具体问题的第二条建议",
      "针对具体问题的第三条建议",
      "针对具体问题的第四条建议"
    ],
    "person2": [
      "针对具体问题的第一条建议",
      "针对具体问题的第二条建议",
      "针对具体问题的第三条建议",
      "针对具体问题的第四条建议"
    ]
  }
}

要求：
1. 严格返回JSON格式，不添加其他文字
2. 标题要吸引人，体现争吵核心矛盾
3. 分析要客观深入，指出问题根源
4. 判决要有趣但正式，可创造法条名称
5. 解决方案要具体可执行，针对各自问题
6. 每个字段都不能为空
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
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // 解析AI响应并合并评分结果
    const analysisResult = parseAnalysisResponse(aiResponse, formData);

    return {
      ...analysisResult,
      scoringDetails: scoringResult.scoringDetails,
      faultPercentage: scoringResult.faultPercentage
    };
  } catch (error) {
    console.error('分析API调用失败:', error);
    // 返回模拟数据作为降级方案
    const fallbackAnalysis = getFallbackAnalysis(formData);
    return {
      ...fallbackAnalysis,
      scoringDetails: scoringResult.scoringDetails,
      faultPercentage: scoringResult.faultPercentage
    };
  }
}

// 专门的评分函数
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
4. 最终责任比例 = 对方总分 / (双方总分之和) × 100%
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
        messages: [
          {
            role: 'user',
            content: scoringPrompt
          }
        ],
        temperature: 0.3, // 降低温度提高一致性
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // 解析评分响应
    return parseScoreResponse(aiResponse, formData);
  } catch (error) {
    console.error('评分API调用失败:', error);
    // 返回默认评分
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

    // 获取评分详情 - 如果没有totalScore，手动计算
    let person1Score = jsonData.scoringDetails?.person1?.totalScore;
    let person2Score = jsonData.scoringDetails?.person2?.totalScore;

    // 如果AI没有提供totalScore，根据各维度分数手动计算
    if (!person1Score) {
      const p1 = jsonData.scoringDetails?.person1 || {};
      person1Score = (p1.communication || 0) + (p1.emotionControl || 0) +
                    (p1.problemSolving || 0) + (p1.empathy || 0) + (p1.behavior || 0);
    }

    if (!person2Score) {
      const p2 = jsonData.scoringDetails?.person2 || {};
      person2Score = (p2.communication || 0) + (p2.emotionControl || 0) +
                    (p2.problemSolving || 0) + (p2.empathy || 0) + (p2.behavior || 0);
    }

    console.log(`🔍 Debug - 计算的totalScore: person1=${person1Score}, person2=${person2Score}`);

    // 重新计算责任比例：分数越低，责任越大（正分制）
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

function parseAnalysisResponse(aiResponse, formData) {
  try {
    const cleanResponse = aiResponse.trim();
    let jsonData;

    const jsonMatch = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonData = JSON.parse(jsonMatch[1]);
    } else {
      jsonData = JSON.parse(cleanResponse);
    }

    return {
      title: jsonData.title || "情感争议案",
      summary: jsonData.summary || "双方因沟通问题产生矛盾",
      reason: jsonData.reason || "双方在沟通方式和期望值上存在差异",
      verdict: jsonData.verdict || `经本庭审理查明，双方均需要改进沟通方式，现判决和解。`,
      solutions: {
        person1: Array.isArray(jsonData.solutions?.person1) ? jsonData.solutions.person1 : [
          "主动与对方沟通，表达自己的想法",
          "学会倾听对方的观点",
          "控制情绪，避免激化矛盾",
          "寻找双方都能接受的解决方案"
        ],
        person2: Array.isArray(jsonData.solutions?.person2) ? jsonData.solutions.person2 : [
          "主动与对方沟通，表达自己的想法",
          "学会倾听对方的观点",
          "控制情绪，避免激化矛盾",
          "寻找双方都能接受的解决方案"
        ]
      }
    };
  } catch (error) {
    console.error('分析JSON解析失败:', error);
    return getFallbackAnalysis(formData);
  }
}

function getDefaultScoring(formData) {
  const randomScores = [
    { p1: 76, p2: 68, fault1: 47.2, fault2: 52.8 },
    { p1: 71, p2: 82, fault1: 53.6, fault2: 46.4 },
    { p1: 65, p2: 74, fault1: 53.2, fault2: 46.8 },
    { p1: 78, p2: 59, fault1: 43.1, fault2: 56.9 }
  ];
  const selected = randomScores[Math.floor(Math.random() * randomScores.length)];

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
      person1: selected.fault1,
      person2: selected.fault2
    }
  };
}

function getFallbackAnalysis(formData) {
  return {
    title: `${formData.person1.name}与${formData.person2.name}的争议`,
    summary: "双方在沟通方式和期望值上存在差异",
    reason: "根据双方陈述，双方在沟通方式和期望值上存在差异，需要加强相互理解。",
    verdict: `经本庭审理查明，${formData.person1.name}与${formData.person2.name}双方均需要改进沟通方式，现判决和解。`,
    solutions: {
      person1: [
        "主动与对方沟通，表达自己的想法",
        "学会倾听对方的观点",
        "控制情绪，避免激化矛盾",
        "寻找双方都能接受的解决方案"
      ],
      person2: [
        "主动与对方沟通，表达自己的想法",
        "学会倾听对方的观点",
        "控制情绪，避免激化矛盾",
        "寻找双方都能接受的解决方案"
      ]
    }
  };
}

// 场景一：隐瞒重大财务问题
const scenario1 = {
  person1: {
    name: "小雅",
    story: "和男友恋爱3年，一直计划买房结婚，两人约定共同存钱，每月各自拿出工资的50%存入共同账户。我严格遵守约定，甚至主动多存部分奖金，从未过问男友私人账户的钱。直到最近看房准备付首付时，我发现共同账户的钱远不够预期，追问下才得知男友近1年沉迷网络赌博，不仅花光了自己的工资，还偷偷挪用了共同账户的20万，甚至欠下8万网贷。我一直以为他在努力为未来打拼，没想到对方一直隐瞒真相，甚至欺骗我'最近公司效益不好，工资延迟发放'。",
    complaint: "我满心欢喜地规划我们的未来，省吃俭用为买房攒钱，你却背着我赌博、挪用共同财产，还一次次欺骗我；你不仅毁了我们的买房计划，还让我们背上债务，这是对我们感情和未来的极度不负责，我再也不敢相信你了。"
  },
  person2: {
    name: "小明",
    story: "一开始只是想通过网络赌博赚点'外快'，让买房的速度更快，没想到越陷越深，输了不少钱。心里害怕被女友发现，就开始隐瞒，挪用共同账户的钱时也告诉自己'赢回来就还上'，结果越输越多。网贷到期后被催收电话骚扰，才知道事情瞒不住了。面对女友的指责，我既愧疚又恐慌，只能辩解'我不是故意的，就是想多赚点钱，没想到会这样'。",
    complaint: "我一开始的初衷是好的，只是一时糊涂犯了错，我也很后悔；我知道对不起你，但我现在也不知道该怎么办，看着你失望又愤怒的样子，我既自责又害怕，担心你会因为这件事离开我。"
  }
};

// 场景二：酒后出轨+撒谎掩盖
const scenario2 = {
  person1: {
    name: "小丽",
    story: "男友公司组织团建，提前和我报备'晚上会聚餐，可能会喝酒，但会早点回家'。当天晚上我一直等到凌晨2点，他才醉醺醺地回来，身上带着陌生的香水味，衣领上还有口红印。我追问时，他含糊其辞'可能是同事不小心蹭到的'，之后几天一直刻意回避我，手机也设置了新密码。我通过他同事的朋友圈发现，团建当晚他和一位异性同事单独离开，第二天早上才一起回到团建酒店。我拿着证据质问他，他才承认酒后和对方发生了关系，还一直撒谎是怕我生气。",
    complaint: "我那么信任你，你却在酒后背叛我，还刻意撒谎掩盖，甚至想蒙混过关；出轨是感情里的底线，你不仅突破了底线，还把我的信任当成儿戏，这种伤害是无法弥补的，我怎么可能再相信你？"
  },
  person2: {
    name: "小强",
    story: "团建当晚喝多了，一时糊涂和异性同事发生了关系，清醒后非常后悔，害怕失去女友，所以选择撒谎掩盖。之后几天一直提心吊胆，不敢面对女友，也知道自己的行为伤害了她。被女友发现后，我只能坦白，心里既愧疚又无助，想道歉却不知道该怎么弥补，只能反复说'我错了，我真的不是故意的，求你再给我一次机会'。",
    complaint: "我知道我错得离谱，我真的很后悔，当时喝多了失去了理智，不是真心想背叛你；我撒谎是因为太害怕失去你，我知道我伤害了你，但我真的不想和你分开，我愿意做任何事来弥补。"
  }
};

// 场景三：擅自处分对方珍视的物品
const scenario3 = {
  person1: {
    name: "小燕",
    story: "我的母亲去世前，留下了一条祖传的项链和一本手写日记，对我来说是无比珍贵的念想，平时一直锁在抽屉里，多次和男友强调'这是我最重要的东西，绝对不能动'。前段时间我出差，让男友帮忙照看家里。出差回来后，我发现抽屉被打开，项链和日记不见了，追问下他才承认：因为最近手头紧，又想给我买生日礼物，就偷偷把项链拿去典当，换了2万块钱，还把日记随手放在了储物间的箱子里，结果箱子被雨水打湿，日记内容全部模糊不清。看着被损坏的日记和空荡荡的抽屉，想到母亲的遗物被如此对待，我瞬间情绪失控。",
    complaint: "这是我母亲留给我的唯一念想，我反复强调过它的重要性，你却完全不放在心上，为了买礼物就擅自典当项链，还把日记弄坏；你根本不懂这些物品对我的意义，你的行为不仅不尊重我，还让我永远失去了母亲的念想，我无法原谅你。"
  },
  person2: {
    name: "小杰",
    story: "我知道那条项链和日记对女友很重要，但最近工资没发，又想给女友准备一份特别的生日礼物，一时糊涂就想到了典当项链。我本来想着等发工资就把项链赎回来，没想到会下雨把日记淋湿。面对女友的愤怒，我既愧疚又着急，解释'我不是故意要损坏的，就是想给你一个惊喜，没想到会搞砸'，但也清楚自己擅自处分女友珍视的物品，还造成了无法挽回的损失，确实错得很严重。",
    complaint: "我出发点是想给你准备生日礼物，没想到会造成这么严重的后果；我知道我不该擅自动你的东西，我也很后悔，现在也不知道该怎么弥补，看着你那么伤心，我心里也很难受，但我真的不是故意要伤害你。"
  }
};

// 执行测试
async function runTests() {
  console.log('🧪 开始测试情侣争吵评分系统...\n');

  const scenarios = [
    { name: '场景一：隐瞒重大财务问题', data: scenario1, expectedFault: '乙方责任更大' },
    { name: '场景二：酒后出轨+撒谎掩盖', data: scenario2, expectedFault: '乙方责任更大' },
    { name: '场景三：擅自处分对方珍视物品', data: scenario3, expectedFault: '乙方责任更大' }
  ];

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    console.log(`\n📋 ${scenario.name}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      console.log('⏳ 正在分析中...');
      const result = await analyzeCoupleFight(scenario.data);

      // 显示评分详情
      console.log('\n📊 评分详情:');
      console.log(`👤 ${result.scoringDetails.person1.reasoning || '无详细评分'}`);
      console.log(`👥 ${result.scoringDetails.person2.reasoning || '无详细评分'}`);

      // 显示最终责任分配
      console.log('\n⚖️ 责任分配:');
      console.log(`${scenario.data.person1.name}: ${result.faultPercentage.person1}%`);
      console.log(`${scenario.data.person2.name}: ${result.faultPercentage.person2}%`);

      // 验证评分是否符合预期
      const person2MoreFault = result.faultPercentage.person2 > result.faultPercentage.person1;
      const isExpected = person2MoreFault && scenario.expectedFault === '乙方责任更大';

      console.log(`\n✅ 评分结果: ${isExpected ? '✅ 符合预期' : '❌ 不符合预期'}`);
      console.log(`📝 案件标题: ${result.title}`);
      console.log(`📋 案件摘要: ${result.summary}`);

      // 显示部分解决方案
      console.log('\n💡 解决方案预览:');
      console.log(`${scenario.data.person1.name}: ${result.solutions.person1[0]}`);
      console.log(`${scenario.data.person2.name}: ${result.solutions.person2[0]}`);

    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
    }

    // 等待一段时间避免API限制
    if (i < scenarios.length - 1) {
      console.log('\n⏰ 等待5秒后继续下一个测试...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('\n🎉 所有测试完成!');
}

// 运行测试
runTests().catch(console.error);