import React, { useState } from 'react';
import styles from './CaseSubmission.module.css';
import JudgeLoading from './JudgeLoading';
import { JudgeAnalysis } from '../services/aiService';

interface CaseSubmissionProps {
  onBack: () => void;
  onSubmitComplete: (formData: any, result: JudgeAnalysis) => void;
}

interface FormData {
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

const CaseSubmission: React.FC<CaseSubmissionProps> = ({ onBack, onSubmitComplete }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: 甲方信息, 2: 乙方信息, 3: 确认提交, 4: 处理中
  const [formData, setFormData] = useState<FormData>({
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

  const handleInputChange = (person: 'person1' | 'person2', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [person]: {
        ...prev[person],
        [field]: value
      }
    }));
  };

  const isStepValid = (step: number) => {
    if (step === 1) {
      return formData.person1.name && formData.person1.story && formData.person1.complaint;
    }
    if (step === 2) {
      return formData.person2.name && formData.person2.story && formData.person2.complaint;
    }
    return false;
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setCurrentStep(4);

    try {
      // 调用后端API进行AI分析
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
          setCurrentStep(3); // 返回确认页
          return;
        } else {
          throw new Error(data.error || 'AI分析失败');
        }
      }

      const aiResult = data.result;

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

      onSubmitComplete(formData, aiResult);
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
        onSubmitComplete(formData, mockResult);
      }, 2000);
    }
  };

  // 处理中状态 - 使用精心设计的 JudgeLoading 组件
  if (currentStep === 4) {
    return <JudgeLoading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          返回首页
        </button>
        <h1 className={styles.title}>提交案件</h1>
        <div className={styles.stepIndicator}>
          <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''} ${currentStep > 1 ? styles.completed : ''}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>甲方信息</span>
          </div>
          <div className={styles.stepConnector}></div>
          <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''} ${currentStep > 2 ? styles.completed : ''}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>乙方信息</span>
          </div>
          <div className={styles.stepConnector}></div>
          <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepLabel}>确认提交</span>
          </div>
        </div>
      </div>

      <div className={styles.contentContainer}>
        {/* 第一步：甲方信息 */}
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>
              <h2>请填写当事人甲的信息</h2>
              <p>请详细描述甲方的情况，这将帮助法官更好地理解案情</p>
            </div>

            <div className={styles.formCard}>
              <div className={styles.inputGroup}>
                <label>姓名</label>
                <input
                  type="text"
                  placeholder="请输入当事人甲的姓名"
                  value={formData.person1.name}
                  onChange={(e) => handleInputChange('person1', 'name', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>事情经过</label>
                <textarea
                  placeholder="请详细描述从甲方角度看到的事情经过..."
                  value={formData.person1.story}
                  onChange={(e) => handleInputChange('person1', 'story', e.target.value)}
                  className={styles.textarea}
                  rows={5}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>委屈诉求</label>
                <textarea
                  placeholder="甲方有什么委屈和诉求？希望得到什么样的解决..."
                  value={formData.person1.complaint}
                  onChange={(e) => handleInputChange('person1', 'complaint', e.target.value)}
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </div>

            <div className={styles.stepActions}>
              <button
                className={`${styles.nextButton} ${!isStepValid(1) ? styles.disabled : ''}`}
                onClick={handleNextStep}
                disabled={!isStepValid(1)}
              >
                下一步：填写乙方信息
              </button>
            </div>
          </div>
        )}

        {/* 第二步：乙方信息 */}
        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>
              <h2>请填写当事人乙的信息</h2>
              <p>请详细描述乙方的情况，确保信息的完整性和准确性</p>
            </div>

            <div className={styles.formCard}>
              <div className={styles.inputGroup}>
                <label>姓名</label>
                <input
                  type="text"
                  placeholder="请输入当事人乙的姓名"
                  value={formData.person2.name}
                  onChange={(e) => handleInputChange('person2', 'name', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>事情经过</label>
                <textarea
                  placeholder="请详细描述从乙方角度看到的事情经过..."
                  value={formData.person2.story}
                  onChange={(e) => handleInputChange('person2', 'story', e.target.value)}
                  className={styles.textarea}
                  rows={5}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>委屈诉求</label>
                <textarea
                  placeholder="乙方有什么委屈和诉求？希望得到什么样的解决..."
                  value={formData.person2.complaint}
                  onChange={(e) => handleInputChange('person2', 'complaint', e.target.value)}
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </div>

            <div className={styles.stepActions}>
              <button className={styles.prevButton} onClick={handlePrevStep}>
                上一步
              </button>
              <button
                className={`${styles.nextButton} ${!isStepValid(2) ? styles.disabled : ''}`}
                onClick={handleNextStep}
                disabled={!isStepValid(2)}
              >
                下一步：确认信息
              </button>
            </div>
          </div>
        )}

        {/* 第三步：确认提交 */}
        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>
              <h2>确认信息并提交</h2>
              <p>请仔细核对以下信息，确认无误后提交给法官汪汪审理</p>
            </div>

            <div className={styles.summaryContainer}>
              <div className={styles.summaryCard}>
                <h3>当事人甲：{formData.person1.name}</h3>
                <div className={styles.summarySection}>
                  <h4>事情经过</h4>
                  <p>{formData.person1.story}</p>
                </div>
                <div className={styles.summarySection}>
                  <h4>委屈诉求</h4>
                  <p>{formData.person1.complaint}</p>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <h3>当事人乙：{formData.person2.name}</h3>
                <div className={styles.summarySection}>
                  <h4>事情经过</h4>
                  <p>{formData.person2.story}</p>
                </div>
                <div className={styles.summarySection}>
                  <h4>委屈诉求</h4>
                  <p>{formData.person2.complaint}</p>
                </div>
              </div>
            </div>

            <div className={styles.stepActions}>
              <button className={styles.prevButton} onClick={handlePrevStep}>
                上一步修改
              </button>
              <button className={styles.submitButton} onClick={handleSubmit}>
                提交给法官审理
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseSubmission;