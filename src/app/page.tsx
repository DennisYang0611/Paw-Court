"use client";
import React, { useState } from 'react';
import styles from './page.module.css';
import JudgeLoading from '../components/JudgeLoading';
import JudgeResult from '../components/JudgeResult';
import LoveIndex from '../components/LoveIndex';
import HistoryVerdicts from '../components/HistoryVerdicts';
import LanguageSwitcher from '../components/LanguageSwitcher';
import JuryMode from '../components/JuryMode';
import CaseSubmission from '../components/CaseSubmission';
import { useTranslation } from '../contexts/I18nContext';
import { JudgeAnalysis } from '../services/aiService';

export default function Home() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [mode, setMode] = useState<'home' | 'jury' | 'submit' | 'history'>('home');
  const [showChangelog, setShowChangelog] = useState(false);
  const [formData, setFormData] = useState({
    person1: {
      name: '',
      story: '',
      complaint: ''
    },
    person2: {
      name: '',
      story: '',
      complaint: ''
    }
  });
  const [judgeResult, setJudgeResult] = useState<JudgeAnalysis | null>(null);

  const handleInputChange = (person: 'person1' | 'person2', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [person]: {
        ...prev[person],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setCurrentStep(2);

    try {
      // 调用后端API进行AI分析，包含限流保护
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // 限流错误，显示友好提示
          alert(`${data.error}\n\n${data.details}`);
          setCurrentStep(1); // 返回表单页
          return;
        } else {
          throw new Error(data.error || 'AI分析失败');
        }
      }

      const aiResult = data.result;
      setJudgeResult(aiResult);

      // 保存到数据库
      try {
        await fetch('/api/verdicts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData,
            result: aiResult,
          }),
        });
        console.log('Verdict saved to database');
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
        // 不影响用户流程，只记录错误
      }

      setCurrentStep(3);
    } catch (error) {
      console.error('AI分析失败:', error);

      // 降级到模拟数据
      const mockResult = {
        title: `${formData.person1.name}与${formData.person2.name}的争议`,
        summary: "双方因沟通问题产生矛盾",
        reason: "AI分析暂时不可用，使用模拟数据展示。双方在沟通方式和期望值上存在差异，需要加强理解和包容。",
        scoringDetails: {
          person1: {
            communication: 7,
            emotionControl: 6,
            problemSolving: 8,
            empathy: 6,
            behavior: 7,
            totalScore: 34,
            reasoning: "在沟通和问题解决方面表现较好，但情绪控制和共情能力需要提升"
          },
          person2: {
            communication: 6,
            emotionControl: 5,
            problemSolving: 7,
            empathy: 7,
            behavior: 6,
            totalScore: 31,
            reasoning: "共情能力较强，但情绪控制和行为表现需要改善"
          }
        },
        faultPercentage: {
          person1: 45,
          person2: 55
        },
        verdict: "经法官汪汪仔细审理，本案双方均有责任。建议双方加强沟通，相互理解。",
        solutions: {
          person1: ["多倾听对方的想法", "表达时语气温和一些", "主动关心对方感受"],
          person2: ["控制情绪，避免激动", "换位思考理解对方", "及时表达自己的需求"]
        }
      };

      // 也保存模拟数据到数据库
      try {
        await fetch('/api/verdicts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData,
            result: mockResult,
          }),
        });
      } catch (dbError) {
        console.error('Failed to save mock result to database:', dbError);
      }

      setTimeout(() => {
        setJudgeResult(mockResult);
        setCurrentStep(3);
      }, 1000);
    }
  };

  const isFormValid = () => {
    return formData.person1.name && formData.person1.story && formData.person1.complaint &&
           formData.person2.name && formData.person2.story && formData.person2.complaint;
  };

  const resetToHome = () => {
    setMode('home');
    setCurrentStep(1);
    setFormData({
      person1: { name: '', story: '', complaint: '' },
      person2: { name: '', story: '', complaint: '' }
    });
    setJudgeResult(null);
  };

  // 处理不同模式
  if (mode === 'jury') {
    return <JuryMode onBack={resetToHome} />;
  }

  if (mode === 'history') {
    return <HistoryVerdicts onBack={resetToHome} />;
  }

  if (mode === 'submit') {
    return (
      <CaseSubmission
        onBack={resetToHome}
        onSubmitComplete={(data, result) => {
          setFormData(data);
          setJudgeResult(result);
          setCurrentStep(3);
          setMode('home');
        }}
      />
    );
  }

  // 原有的案件处理流程
  if (currentStep === 2) {
    return <JudgeLoading />;
  }

  if (currentStep === 3) {
    if (!judgeResult) {
      return <JudgeLoading />;
    }
    return (
      <JudgeResult
        result={judgeResult}
        formData={formData}
        onNext={() => setCurrentStep(4)}
      />
    );
  }

  if (currentStep === 4) {
    return (
      <LoveIndex
        onBack={resetToHome}
        onHistory={() => setMode('history')}
        formData={formData}
        judgeResult={judgeResult}
      />
    );
  }

  // 新的首页 - 选择模式
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <LanguageSwitcher />
          <button
            className={styles.historyQuickButton}
            onClick={() => setMode('history')}
            title="历史案例"
          >
            <span className={styles.historyButtonIcon}>📚</span>
            <span className={styles.historyButtonText}>历史案例</span>
          </button>
        </div>
        <h1 className={styles.title}>
          {t.homepage.title}
        </h1>
        <p className={styles.subtitle}>{t.homepage.subtitle}</p>

        {/* 新版本发布气泡 */}
        <div className={styles.versionBubble} onClick={() => setShowChangelog(true)}>
          <span className={styles.bubbleIcon}>🌟</span>
          <span className={styles.bubbleText}>新版本发布，快来当正义小法官吧！</span>
        </div>
      </div>

      {/* 更新日志弹窗 */}
      {showChangelog && (
        <div className={styles.changelogOverlay} onClick={() => setShowChangelog(false)}>
          <div className={styles.changelogModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.changelogHeader}>
              <h3>🌟 汪汪法庭更新日志</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowChangelog(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.changelogContent}>
              <div className={styles.changelogSection}>
                <h4>🌟 核心功能新增</h4>
                <ul>
                  <li><strong>新增陪审团投票模式</strong> - 支持快速投票直达下一案例，吃瓜决策更高效，互动体验升级</li>
                  <li><strong>新增悬浮窗投票功能</strong> - 陪审团模式专属优化，可边浏览案件详情边完成判决，操作流程更流畅</li>
                  <li><strong>新增案件提交确认页</strong> - 提交前二次校验关键信息，有效降低填写错误率，提升数据准确性</li>
                  <li><strong>新增历史记录跳转页</strong> - 支持快速定位目标案件，历史内容查阅效率大幅提升</li>
                </ul>
              </div>

              <div className={styles.changelogSection}>
                <h4>🎨 交互体验优化</h4>
                <ul>
                  <li><strong>首页入口重构</strong> - 拆分「案件评审」与「案件提交」双入口，功能路径更清晰，用户可快速直达需求场景</li>
                  <li><strong>案件描述输入逻辑优化</strong> - 支持分步骤填写双方信息（先输入一方诉求，再补充另一方情况），交互更符合用户操作习惯</li>
                  <li><strong>历史记录搜索升级</strong> - 新增「提交人昵称」「案件名称」双维度搜索，精准匹配目标内容，查找更便捷</li>
                </ul>
              </div>

              <div className={styles.changelogSection}>
                <h4>📌 温馨提示</h4>
                <p>为避免数据冗余及人工核对成本，建议大家使用匿名方式提交案件，感谢您的理解与配合～</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.judgeIcon}>
        <img src="/judge-dog.png" alt={t.homepage.judgeName} className={styles.dogImage} />
        <p className={styles.judgeName}>{t.homepage.judgeName}</p>
      </div>

      <div className={styles.modeSelection}>
        <div className={styles.modeCard} onClick={() => setMode('jury')}>
          <div className={styles.modeIcon}>🗳️</div>
          <h3 className={styles.modeTitle}>{t.homepage.modeJuryTitle}</h3>
          <p className={styles.modeDescription}>
            {t.homepage.modeJuryDesc}
          </p>
          <div className={styles.modeFeatures}>
            <span className={styles.featureTag}>{t.homepage.featureSmartAssign}</span>
            <span className={styles.featureTag}>{t.homepage.featureVoteStance}</span>
            <span className={styles.featureTag}>{t.homepage.featureGroupDiscussion}</span>
          </div>
        </div>

        <div className={styles.modeCard} onClick={() => setMode('submit')}>
          <div className={styles.modeIcon}>📝</div>
          <h3 className={styles.modeTitle}>{t.homepage.modeSubmitTitle}</h3>
          <p className={styles.modeDescription}>
            {t.homepage.modeSubmitDesc}
          </p>
          <div className={styles.modeFeatures}>
            <span className={styles.featureTag}>{t.homepage.featureSimpleForm}</span>
            <span className={styles.featureTag}>{t.homepage.featureAiAnalysis}</span>
            <span className={styles.featureTag}>{t.homepage.featurePracticalSolution}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
