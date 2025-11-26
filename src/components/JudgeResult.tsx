import React from 'react';
import styles from './JudgeResult.module.css';

interface JudgeResultProps {
  result: {
    reason: string;
    faultPercentage: {
      person1: number;
      person2: number;
    };
    verdict: string;
    solutions: {
      person1: string[];
      person2: string[];
    };
  };
  formData: {
    person1: { name: string; };
    person2: { name: string; };
  };
  onNext: () => void;
}

const JudgeResult: React.FC<JudgeResultProps> = ({ result, formData, onNext }) => {
  return (
    <div className={styles.container}>
      <div className={styles.verdict}>
        <div className={styles.verdictHeader}>
          <div className={styles.courtSeal}>⚖️</div>
          <h1 className={styles.title}>汪汪法庭判决书</h1>
          <div className={styles.caseNumber}>案件编号：CP-{Date.now()}</div>
        </div>

        <div className={styles.judgeInfo}>
          <div className={styles.judgeAvatar}>
            <img src="/judge-dog.png" alt="法官米粒" style={{width: '60px', height: '60px', borderRadius: '50%'}} />
          </div>
          <div className={styles.judgeTitle}>
            <h3>主审法官：米粒大法官</h3>
            <p>爱情纠纷专业调解员</p>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>💭 争执原因分析</h3>
          <div className={styles.reasonBox}>
            <p>{result.reason}</p>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>⚖️ 责任分配</h3>
          <div className={styles.faultAnalysis}>
            <div className={styles.responsibilitySplit}>
              <div className={styles.splitContainer}>
                <div
                  className={styles.leftPerson}
                  style={{width: `${result.faultPercentage.person1}%`}}
                >
                  <span className={styles.personLabel}>{formData.person1.name}</span>
                  <span className={styles.personPercentage}>{result.faultPercentage.person1}%</span>
                </div>
                <div
                  className={styles.rightPerson}
                  style={{width: `${result.faultPercentage.person2}%`}}
                >
                  <span className={styles.personLabel}>{formData.person2.name}</span>
                  <span className={styles.personPercentage}>{result.faultPercentage.person2}%</span>
                </div>
              </div>
              <div className={styles.splitLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{backgroundColor: 'var(--rose-gold)'}}></div>
                  <span>{formData.person1.name}</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{backgroundColor: 'var(--cream-dark)'}}></div>
                  <span>{formData.person2.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📜 最终判决</h3>
          <div className={styles.verdictBox}>
            <div className={styles.stamp}>
              <span>法庭</span>
              <span>认证</span>
            </div>
            <p className={styles.verdictText}>{result.verdict}</p>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>💡 和解方案</h3>
          <div className={styles.solutions}>
            <div className={styles.solutionBox}>
              <h4>{formData.person1.name} 需要做的：</h4>
              <ul>
                {result.solutions.person1.map((solution, index) => (
                  <li key={index}>{solution}</li>
                ))}
              </ul>
            </div>

            <div className={styles.solutionBox}>
              <h4>{formData.person2.name} 需要做的：</h4>
              <ul>
                {result.solutions.person2.map((solution, index) => (
                  <li key={index}>{solution}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.signature}>
          <div className={styles.signatureBox}>
            <p>审理法官：米粒大法官</p>
            <p>判决时间：{new Date().toLocaleString('zh-CN')}</p>
            <div className={styles.officialSeal}>
              <div className={styles.sealInner}>
                <div className={styles.sealText}>
                  <span>汪汪法庭</span>
                  <span>官方印章</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.nextButton} onClick={onNext}>
            查看爱情指数 💕
          </button>
        </div>
      </div>
    </div>
  );
};

export default JudgeResult;