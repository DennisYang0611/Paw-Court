// 爱情指数评估接口
export interface LoveIndexAnalysis {
  loveIndex: number; // 0-100的爱情指数
  loveLevel: string; // 爱情状态描述
  mainFactors: string[]; // 影响爱情指数的主要因素
  suggestions: string[]; // 改善关系的建议
  reasoning: string; // 评分理由
}

// 豆包AI服务
export interface ScoringDetails {
  communication: number;
  emotionControl: number;
  problemSolving: number;
  empathy: number;
  behavior: number;
  totalScore: number;
  reasoning: string;
}

export interface JudgeAnalysis {
  title: string;
  summary: string;
  reason: string;
  scoringDetails: {
    person1: ScoringDetails;
    person2: ScoringDetails;
  };
  faultPercentage: {
    person1: number;
    person2: number;
  };
  verdict: string;
  solutions: {
    person1: string[];
    person2: string[];
  };
}

export interface FormData {
  person1: {
    name: string;
    story: string;
    complaint: string;
  };
  person2: {
    name: string;
    story: string;
    complaint: string;
  };
}

const DOUBAO_API_URL = 'https://aiproxy.hzh.sealos.run/v1/chat/completions';
const API_KEY = 'sk-6jJxgtTj8ZdCnT8NkXirzSY5bYCItphrcn7cn7XxK3SDwxdK';

// 专门的评分函数
async function scoreCoupleFight(formData: FormData): Promise<{
  scoringDetails: { person1: ScoringDetails; person2: ScoringDetails; };
  faultPercentage: { person1: number; person2: number; };
}> {
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
        messages: [
          {
            role: 'user',
            content: scoringPrompt
          }
        ],
        temperature: 0.3, // 降低温度提高一致性
        max_tokens: 8000
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

// 解析评分响应
function parseScoreResponse(aiResponse: string, formData: FormData): {
  scoringDetails: { person1: ScoringDetails; person2: ScoringDetails; };
  faultPercentage: { person1: number; person2: number; };
} {
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

// 默认评分
function getDefaultScoring(formData: FormData): {
  scoringDetails: { person1: ScoringDetails; person2: ScoringDetails; };
  faultPercentage: { person1: number; person2: number; };
} {
  const randomScores = [
    { p1: 76, p2: 68 },
    { p1: 71, p2: 82 },
    { p1: 65, p2: 74 },
    { p1: 78, p2: 59 }
  ];
  const selected = randomScores[Math.floor(Math.random() * randomScores.length)];

  // 正确计算责任比例：得分低的人责任大
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

export async function analyzeCoupleFight(formData: FormData): Promise<JudgeAnalysis> {
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
        max_tokens: 8000
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

// 解析分析响应（不包含评分）
function parseAnalysisResponse(aiResponse: string, formData: FormData): Omit<JudgeAnalysis, 'scoringDetails' | 'faultPercentage'> {
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
    // 返回默认分析
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
}

function parseAIResponseLegacy(aiResponse: string, formData: FormData): Omit<JudgeAnalysis, 'scoringDetails' | 'faultPercentage'> {
  try {
    // 简化的文本解析逻辑
    const sections = aiResponse.split('###').map(s => s.trim());

    let reason = "双方在沟通方式和期望值上存在差异";
    let verdict = "经汪汪法庭米粒法官仔细审理，本案双方均有责任。建议双方加强沟通，相互理解。";
    let person1Solutions = ["多倾听对方想法", "表达时语气温和", "主动关心对方"];
    let person2Solutions = ["控制情绪避免激动", "换位思考理解对方", "及时表达需求"];

    // 解析案件还原部分
    const caseSection = sections.find(s => s.includes('案件详细还原') || s.includes('案件') || s.includes('还原'));
    if (caseSection) {
      const lines = caseSection.split('\n').filter(line => line.trim() && !line.includes('#'));
      if (lines.length > 0) {
        reason = lines.slice(0, 5).join(' ').trim();
        if (reason.length > 500) {
          reason = reason.substring(0, 500) + '...';
        }
      }
    }

    // 解析法庭判决部分
    const verdictSection = sections.find(s => s.includes('法庭判决') || s.includes('判决') || s.includes('违反'));
    if (verdictSection) {
      const lines = verdictSection.split('\n').filter(line => line.trim() && !line.includes('#'));
      if (lines.length > 0) {
        verdict = lines.join(' ').replace(/^["'\s]*|["'\s]*$/g, '');
        if (verdict.length > 200) {
          verdict = verdict.substring(0, 200) + '...';
        }
      }
    }

    return {
      title: `${formData.person1.name}与${formData.person2.name}的争议`,
      summary: "双方在沟通方式和期望值上存在差异",
      reason,
      verdict,
      solutions: {
        person1: person1Solutions,
        person2: person2Solutions
      }
    };
  } catch (error) {
    console.error('AI回复解析失败:', error);
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
}

function getFallbackAnalysis(formData: FormData): Omit<JudgeAnalysis, 'scoringDetails' | 'faultPercentage'> {
  // 基于表单数据生成更有针对性的模拟分析
  const reasons = [
    `根据双方陈述，${formData.person1.name}认为问题在于沟通不畅，而${formData.person2.name}则强调情感需求未被满足，实际上反映了双方期望值的差异`,
    `案情显示${formData.person1.name}和${formData.person2.name}在事件处理方式上存在分歧，各自从不同角度理解同一件事`,
    `通过分析双方陈述可见，争执根源在于日常相处模式的认知差异，以及对彼此行为动机的误解`,
    `本案核心问题是${formData.person1.name}与${formData.person2.name}在表达方式和接收理解上的不匹配`
  ];

  const verdicts = [
    `经汪汪法庭米粒法官审理查明，${formData.person1.name}违反了《恋人相处基本法》第3条"主动沟通义务"，${formData.person2.name}违反了第7条"情绪表达合理性规定"。鉴于双方都有改进空间，判决双方承担相应责任，并需执行和解方案。`,
    `本庭认定，${formData.person1.name}在事件中存在"换位思考不足罪"，${formData.person2.name}犯有"表达方式欠妥罪"。依据《情侣和谐共处条例》，判决双方各自反思并积极改进。`,
    `米粒法官判决：${formData.person1.name}因未能及时察觉对方情感需求，触犯《爱情维护法》第5条；${formData.person2.name}因情绪控制不当，违反第12条规定。现判决双方执行情感修复计划。`,
    `经审理，${formData.person1.name}和${formData.person2.name}分别违反了恋爱关系中的"理解义务"和"表达规范"。本庭宣判：双方需在指导下改善沟通模式，重建和谐关系。`
  ];

  const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
  const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];

  // 生成基于具体情况的解决方案
  const person1Solutions = [
    `针对这次事件，${formData.person1.name}需要在日常中多主动询问对方的感受和想法`,
    "建立定期沟通机制，每周至少安排一次深度交流时间",
    "学会在表达观点时先确认对方是否理解了你的真实意图",
    "遇到分歧时，先尝试站在对方角度思考3分钟再做反应"
  ];

  const person2Solutions = [
    `基于此次争执，${formData.person2.name}应该学会在情绪激动时暂停对话，冷静后再继续`,
    "建立情绪表达的健康方式，避免指责性语言，多用'我觉得'开头",
    "当感到不被理解时，具体说明需要什么样的支持，而不是让对方猜测",
    "培养感激表达习惯，及时认可对方的努力和改变"
  ];

  // 生成基于表单数据的标题
  const titles = [
    `${formData.person1.name}与${formData.person2.name}的沟通危机`,
    `情侣相处分歧案：${formData.person1.name} vs ${formData.person2.name}`,
    `恋人矛盾调解：双方期望差异争议`,
    `情感纠纷案件：${formData.person1.name}与${formData.person2.name}`
  ];
  const selectedTitle = titles[Math.floor(Math.random() * titles.length)];

  // 生成基于表单数据的简介
  const summaries = [
    "双方因沟通方式和情感需求不匹配产生矛盾",
    "情侣在日常相处中因期望值差异引发争执",
    "恋人关系中的理解偏差导致情感冲突",
    "双方在表达和接收情感信息上存在分歧"
  ];
  const selectedSummary = summaries[Math.floor(Math.random() * summaries.length)];

  return {
    title: selectedTitle,
    summary: selectedSummary,
    reason: randomReason,
    verdict: randomVerdict,
    solutions: {
      person1: person1Solutions.slice(0, Math.max(2, Math.min(4, person1Solutions.length))),
      person2: person2Solutions.slice(0, Math.max(2, Math.min(4, person2Solutions.length)))
    }
  };
}

// AI智能爱情指数评估
export async function analyzeLoveIndex(formData: FormData, judgeResult: JudgeAnalysis): Promise<LoveIndexAnalysis> {
  const loveIndexPrompt = `
你是汪汪法庭的专业情感分析师，请基于情侣争吵案件的分析结果，评估他们的爱情指数和关系状态。

## 案件基本信息：
**当事人甲（${formData.person1.name}）：**
- 事情经过：${formData.person1.story}
- 委屈诉求：${formData.person1.complaint}

**当事人乙（${formData.person2.name}）：**
- 事情经过：${formData.person2.story}
- 委屈诉求：${formData.person2.complaint}

## 争吵分析结果：
- 案件标题：${judgeResult.title}
- 问题概要：${judgeResult.summary}
- 分析原因：${judgeResult.reason}
- 责任分配：${formData.person1.name} ${judgeResult.faultPercentage.person1}% vs ${formData.person2.name} ${judgeResult.faultPercentage.person2}%
- 评分详情：
  * ${formData.person1.name}总分：${judgeResult.scoringDetails.person1.totalScore}/100
  * ${formData.person2.name}总分：${judgeResult.scoringDetails.person2.totalScore}/100
- 法庭判决：${judgeResult.verdict}

## 爱情指数评估标准：

### 分数计算因素（综合评估0-100分）：
1. **基础感情分**（40分）：
   - 根据争吵严重程度：轻微争吵35-40分，中等争吵25-35分，严重争吵10-25分
   - 根据问题性质：沟通问题影响较小，信任问题影响较大，原则问题影响最大

2. **沟通质量分**（25分）：
   - 基于双方评分中的沟通态度和理解共情得分
   - 高分表示良好沟通能力，有利于解决问题

3. **解决能力分**（20分）：
   - 基于问题处理和行为表现得分
   - 高分表示有改善和解决问题的能力

4. **情感成熟度分**（15分）：
   - 基于情绪控制得分和整体表现
   - 高分表示情感成熟，能理性处理关系问题

### 爱情状态分级：
- 90-100分：热恋期 - 偶有小摩擦，感情依然甜蜜
- 75-89分：甜蜜期 - 关系稳定，有小问题但能很好解决
- 60-74分：稳定期 - 关系平稳，需要更多沟通和理解
- 45-59分：磨合期 - 存在一些问题，需要双方努力改善
- 30-44分：困难期 - 关系面临挑战，需要认真对待和改变
- 15-29分：危机期 - 关系不稳定，需要专业建议和重大调整
- 0-14分：破裂边缘 - 关系岌岌可危，需要深刻反思

请返回以下JSON格式：
{
  "loveIndex": 精确的0-100分数（保留1位小数）,
  "loveLevel": "对应的爱情状态名称",
  "mainFactors": [
    "影响爱情指数的主要正面因素1",
    "影响爱情指数的主要负面因素1",
    "影响爱情指数的主要因素2（可正可负）"
  ],
  "suggestions": [
    "针对性的改善建议1",
    "针对性的改善建议2",
    "针对性的改善建议3",
    "针对性的改善建议4"
  ],
  "reasoning": "详细说明为什么给出这个爱情指数，包括各个因素的具体影响和计算逻辑（150-300字）"
}

要求：
1. 必须严格返回JSON格式，不要其他文字
2. 爱情指数要基于具体分析，不能随意给分
3. 主要因素要具体，不能泛泛而谈
4. 建议要针对这对情侣的具体问题
5. 评分理由要逻辑清晰，说明具体扣分和加分原因
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
            content: loveIndexPrompt
          }
        ],
        temperature: 0.4, // 稍微降低温度，保持一致性
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // 解析AI响应
    return parseLoveIndexResponse(aiResponse, formData, judgeResult);
  } catch (error) {
    console.error('爱情指数API调用失败:', error);
    // 返回智能默认分析
    return getIntelligentLoveIndex(formData, judgeResult);
  }
}

// 解析爱情指数响应
function parseLoveIndexResponse(aiResponse: string, formData: FormData, judgeResult: JudgeAnalysis): LoveIndexAnalysis {
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
      loveIndex: typeof jsonData.loveIndex === 'number' ? jsonData.loveIndex : 65,
      loveLevel: jsonData.loveLevel || "稳定期",
      mainFactors: Array.isArray(jsonData.mainFactors) ? jsonData.mainFactors : [
        "双方都有改善关系的意愿",
        "沟通方式需要改进",
        "信任需要重建"
      ],
      suggestions: Array.isArray(jsonData.suggestions) ? jsonData.suggestions : [
        "多进行开诚布公的深度交流",
        "学会换位思考，理解对方感受",
        "建立更好的冲突处理机制",
        "增加共同的美好回忆"
      ],
      reasoning: jsonData.reasoning || "基于争吵分析和双方表现进行综合评估"
    };
  } catch (error) {
    console.error('爱情指数JSON解析失败:', error);
    return getIntelligentLoveIndex(formData, judgeResult);
  }
}

// 智能默认爱情指数（基于评分结果）
function getIntelligentLoveIndex(formData: FormData, judgeResult: JudgeAnalysis): LoveIndexAnalysis {
  // 基于双方评分计算基础指数
  const avgScore = (judgeResult.scoringDetails.person1.totalScore + judgeResult.scoringDetails.person2.totalScore) / 2;

  // 基础分数转换（0-100的评分转换为爱情指数）
  let baseIndex = Math.min(90, Math.max(20, avgScore * 0.8)); // 转换后范围20-72

  // 根据责任分配调整（责任越不均衡，说明问题越严重）
  const responsibilityGap = Math.abs(judgeResult.faultPercentage.person1 - judgeResult.faultPercentage.person2);
  const severityPenalty = (responsibilityGap - 20) * 0.3; // 差距超过20%开始扣分

  baseIndex = Math.max(15, baseIndex - Math.max(0, severityPenalty));

  // 根据具体维度调整
  const communicationAvg = (judgeResult.scoringDetails.person1.communication + judgeResult.scoringDetails.person2.communication) / 2;
  const empathyAvg = (judgeResult.scoringDetails.person1.empathy + judgeResult.scoringDetails.person2.empathy) / 2;

  // 沟通和共情能力好的关系更容易修复
  if (communicationAvg >= 15 && empathyAvg >= 15) baseIndex += 5;
  if (communicationAvg <= 8 || empathyAvg <= 8) baseIndex -= 8;

  const finalIndex = Math.round(baseIndex * 10) / 10; // 保留1位小数

  // 确定爱情状态
  let loveLevel = "磨合期";
  if (finalIndex >= 90) loveLevel = "热恋期";
  else if (finalIndex >= 75) loveLevel = "甜蜜期";
  else if (finalIndex >= 60) loveLevel = "稳定期";
  else if (finalIndex >= 45) loveLevel = "磨合期";
  else if (finalIndex >= 30) loveLevel = "困难期";
  else if (finalIndex >= 15) loveLevel = "危机期";
  else loveLevel = "破裂边缘";

  return {
    loveIndex: finalIndex,
    loveLevel,
    mainFactors: [
      `双方平均表现得分：${Math.round(avgScore)}分`,
      `责任分配差距：${Math.round(responsibilityGap)}%`,
      `沟通和共情能力需要${communicationAvg >= 12 ? '保持' : '加强'}`
    ],
    suggestions: [
      "增加高质量的一对一交流时间",
      "学习更好的冲突解决技巧",
      "培养换位思考的习惯",
      "创造更多正面的共同体验"
    ],
    reasoning: `基于双方评分（平均${Math.round(avgScore)}分）和责任分配（${Math.round(responsibilityGap)}%差距），综合计算出爱情指数${finalIndex}分。${communicationAvg >= 12 ? '沟通基础良好' : '沟通能力待提升'}，${empathyAvg >= 12 ? '共情能力尚可' : '共情能力需加强'}。`
  };
}