import React, { useState, useEffect } from 'react';
import styles from './JuryMode.module.css';
import { generateDeviceFingerprint } from '../utils/clientUtils';
import JuryPanel from './JuryPanel';

interface JuryModeProps {
  onBack: () => void;
}

interface VerdictItem {
  _id: string;
  caseId: string;
  timestamp: string;
  title: string;
  summary: string;
  persons: {
    person1: { name: string; story: string; complaint: string };
    person2: { name: string; story: string; complaint: string };
  };
  result: {
    reason: string;
    faultPercentage: { person1: number; person2: number };
    verdict: string;
    solutions: { person1: string[]; person2: string[] };
  };
  votes: {
    likes: number;
    dislikes: number;
    voters: string[];
  };
}

const JuryMode: React.FC<JuryModeProps> = ({ onBack }) => {
  const [currentCase, setCurrentCase] = useState<VerdictItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [noMoreCases, setNoMoreCases] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fingerprint = generateDeviceFingerprint();
    setDeviceFingerprint(fingerprint);
  }, []);

  useEffect(() => {
    if (deviceFingerprint) {
      fetchRandomCase();
    }
  }, [deviceFingerprint]);

  const fetchRandomCase = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/verdicts/random?deviceFingerprint=${deviceFingerprint}`);

      if (!response.ok) {
        if (response.status === 404) {
          setNoMoreCases(true);
          setCurrentCase(null);
          return;
        }
        throw new Error('获取案例失败');
      }

      const data = await response.json();
      setCurrentCase(data.verdict);
      setHasVoted(false);
      setNoMoreCases(false);
    } catch (error) {
      console.error('Error fetching random case:', error);
      setError('获取案例时出现错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSuccess = () => {
    setHasVoted(true);
  };

  const handleNextCase = () => {
    fetchRandomCase();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>
            返回首页
          </button>
          <h1 className={styles.title}>陪审团模式</h1>
        </div>
        <div className={styles.loading}>
          <img
            src="/img/image copy.png"
            alt="Loading"
            className={styles.loadingDog}
          />
          <div className={styles.spinner}></div>
          <p>正在为您推送案例...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>
            返回首页
          </button>
          <h1 className={styles.title}>陪审团模式</h1>
        </div>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>出现错误</h3>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={fetchRandomCase}>
            重试
          </button>
        </div>
      </div>
    );
  }

  if (noMoreCases) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>
            返回首页
          </button>
          <h1 className={styles.title}>陪审团模式</h1>
        </div>
        <div className={styles.noMoreCases}>
          <div className={styles.completionIcon}>🎉</div>
          <h3>太棒了！</h3>
          <p>您已经参与了所有可用的案例投票</p>
          <p>感谢您作为陪审团成员的参与！</p>
          <div className={styles.actionButtons}>
            <button className={styles.refreshButton} onClick={fetchRandomCase}>
              刷新查看新案例
            </button>
            <button className={styles.backButtonSecondary} onClick={onBack}>
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>
            返回首页
          </button>
          <h1 className={styles.title}>陪审团模式</h1>
        </div>
        <div className={styles.noCase}>
          <p>暂无可用案例</p>
          <button className={styles.refreshButton} onClick={fetchRandomCase}>
            刷新
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          返回首页
        </button>
        <h1 className={styles.title}>陪审团模式</h1>
        <p className={styles.subtitle}>作为陪审团成员，请仔细阅读案例并表达您的观点</p>
      </div>

      <div className={styles.caseContainer}>
        <div className={styles.caseHeader}>
          <h2>案例 #{currentCase.caseId}</h2>
          <span className={styles.caseDate}>{formatDate(currentCase.timestamp)}</span>
        </div>

        <div className={styles.caseTitle}>
          <h3>{currentCase.title}</h3>
        </div>

        <div className={styles.caseSummary}>
          <h4>案例摘要</h4>
          <p>{currentCase.summary}</p>
        </div>

        <div className={styles.parties}>
          <div className={styles.party}>
            <h4>当事人甲：{currentCase.persons.person1.name}</h4>
            <div className={styles.storySection}>
              <h5>事情经过</h5>
              <p>{currentCase.persons.person1.story}</p>
            </div>
            <div className={styles.complaintSection}>
              <h5>委屈诉求</h5>
              <p>{currentCase.persons.person1.complaint}</p>
            </div>
          </div>

          <div className={styles.party}>
            <h4>当事人乙：{currentCase.persons.person2.name}</h4>
            <div className={styles.storySection}>
              <h5>事情经过</h5>
              <p>{currentCase.persons.person2.story}</p>
            </div>
            <div className={styles.complaintSection}>
              <h5>委屈诉求</h5>
              <p>{currentCase.persons.person2.complaint}</p>
            </div>
          </div>
        </div>

        <div className={styles.aiJudgment}>
          <h4>AI法官判决</h4>
          <div className={styles.analysis}>
            <h5>案件分析</h5>
            <p>{currentCase.result.reason}</p>
          </div>

          <div className={styles.responsibility}>
            <h5>责任分配</h5>
            <div className={styles.responsibilityChart}>
              <div className={styles.chartContainer}>
                <div
                  className={styles.person1Bar}
                  style={{width: `${currentCase.result.faultPercentage.person1}%`}}
                >
                  <span>{currentCase.persons.person1.name} {currentCase.result.faultPercentage.person1}%</span>
                </div>
                <div
                  className={styles.person2Bar}
                  style={{width: `${currentCase.result.faultPercentage.person2}%`}}
                >
                  <span>{currentCase.persons.person2.name} {currentCase.result.faultPercentage.person2}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.verdict}>
            <h5>最终判决</h5>
            <p>{currentCase.result.verdict}</p>
          </div>
        </div>

        <JuryPanel
          verdictId={currentCase._id}
          person1Name={currentCase.persons.person1.name}
          person2Name={currentCase.persons.person2.name}
          onVoteSuccess={handleVoteSuccess}
          isFloating={true}
        />

        {hasVoted && (
          <div className={styles.nextCaseSection}>
            <div className={styles.voteSuccess}>
              <div className={styles.successIcon}>✅</div>
              <p>感谢您的参与！您的观点已记录</p>
            </div>
            <button className={styles.nextCaseButton} onClick={handleNextCase}>
              查看下一个案例
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JuryMode;