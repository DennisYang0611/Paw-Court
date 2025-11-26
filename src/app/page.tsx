"use client";
import React, { useState } from 'react';
import styles from './page.module.css';
import JudgeLoading from '../components/JudgeLoading';
import JudgeResult from '../components/JudgeResult';
import LoveIndex from '../components/LoveIndex';
import HistoryVerdicts from '../components/HistoryVerdicts';
import { JudgeAnalysis } from '../services/aiService';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
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
        onBack={() => setCurrentStep(1)}
        onHistory={() => setCurrentStep(5)}
        formData={formData}
        judgeResult={judgeResult}
      />
    );
  }

  if (currentStep === 5) {
    return <HistoryVerdicts onBack={() => setCurrentStep(1)} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button
            className={styles.historyQuickButton}
            onClick={() => setCurrentStep(5)}
            title="查看历史裁决"
          >
            <span className={styles.historyButtonIcon}>📚</span>
            <span className={styles.historyButtonText}>历史</span>
          </button>
        </div>
        <h1 className={styles.title}>
          汪汪法庭
        </h1>
        <p className={styles.subtitle}>让公正的小法官米粒为你们裁决吧！</p>
      </div>

      <div className={styles.judgeIcon}>
        <img src="/judge-dog.png" alt="法官米粒" className={styles.dogImage} />
        <p className={styles.judgeName}>法官米粒</p>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.personForm}>
          <div className={styles.formHeader}>
            <h3>
              当事人甲
            </h3>
          </div>
          <div className={styles.inputGroup}>
            <label>姓名/昵称</label>
            <input
              type="text"
              placeholder="请输入姓名或昵称"
              value={formData.person1.name}
              onChange={(e) => handleInputChange('person1', 'name', e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>事情经过</label>
            <textarea
              placeholder="详细描述一下发生了什么事情..."
              value={formData.person1.story}
              onChange={(e) => handleInputChange('person1', 'story', e.target.value)}
              className={styles.textarea}
              rows={4}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>委屈的点</label>
            <textarea
              placeholder="说说你觉得委屈的地方..."
              value={formData.person1.complaint}
              onChange={(e) => handleInputChange('person1', 'complaint', e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.personForm}>
          <div className={styles.formHeader}>
            <h3>
              当事人乙
            </h3>
          </div>
          <div className={styles.inputGroup}>
            <label>姓名/昵称</label>
            <input
              type="text"
              placeholder="请输入姓名或昵称"
              value={formData.person2.name}
              onChange={(e) => handleInputChange('person2', 'name', e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>事情经过</label>
            <textarea
              placeholder="详细描述一下发生了什么事情..."
              value={formData.person2.story}
              onChange={(e) => handleInputChange('person2', 'story', e.target.value)}
              className={styles.textarea}
              rows={4}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>委屈的点</label>
            <textarea
              placeholder="说说你觉得委屈的地方..."
              value={formData.person2.complaint}
              onChange={(e) => handleInputChange('person2', 'complaint', e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.submitButton} ${!isFormValid() ? styles.disabled : ''}`}
          onClick={handleSubmit}
          disabled={!isFormValid()}
        >
          提交给法官审理
        </button>

        <button
          className={styles.historyButton}
          onClick={() => setCurrentStep(5)}
        >
          📚 查看历史裁决
        </button>
      </div>
    </div>
  );
}
