import React, { useState, useEffect } from 'react';
import styles from './LoveIndex.module.css';
import { analyzeLoveIndex, LoveIndexAnalysis } from '../services/aiService';
import LoveIndexLoading from './LoveIndexLoading';

interface LoveIndexProps {
  onBack: () => void;
  onHistory: () => void;
  formData?: any; // 表单数据
  judgeResult?: any; // 判决结果
}

interface Activity {
  id: number;
  title: string;
  description: string;
  icon: string; // 改为string类型存储emoji
  type: 'date' | 'communication' | 'surprise' | 'together';
  loveBoost: number;
}

const LoveIndex: React.FC<LoveIndexProps> = ({ onBack, onHistory, formData, judgeResult }) => {
  const [loveIndex, setLoveIndex] = useState(0);
  const [showActivities, setShowActivities] = useState(false);
  const [loveAnalysis, setLoveAnalysis] = useState<LoveIndexAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // AI智能爱情指数分析
  useEffect(() => {
    const analyzeLove = async () => {
      if (formData && judgeResult) {
        try {
          const analysis = await analyzeLoveIndex(formData, judgeResult);
          setLoveAnalysis(analysis);

          // 动画显示爱情指数
          let current = 0;
          const target = analysis.loveIndex;
          const increment = target / 50;

          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              setLoveIndex(current);
              setTimeout(() => setShowActivities(true), 1000);
              clearInterval(interval);
              setIsLoading(false);
            } else {
              setLoveIndex(current);
            }
          }, 50);

          return () => clearInterval(interval);
        } catch (error) {
          console.error('爱情指数分析失败:', error);
          // 降级到默认行为
          const defaultIndex = 65;
          setLoveIndex(defaultIndex);
          setShowActivities(true);
          setIsLoading(false);
        }
      } else {
        // 没有数据时使用默认行为
        const defaultIndex = 65;
        setLoveIndex(defaultIndex);
        setShowActivities(true);
        setIsLoading(false);
      }
    };

    analyzeLove();
  }, [formData, judgeResult]);

  const activities: Activity[] = [
    {
      id: 1,
      title: "一起做饭",
      description: "准备一顿浪漫的烛光晚餐，享受二人世界",
      icon: "👨‍🍳",
      type: "together",
      loveBoost: 15
    },
    {
      id: 2,
      title: "深度聊天",
      description: "找个安静的地方，聊聊彼此的想法和感受",
      icon: "💬",
      type: "communication",
      loveBoost: 20
    },
    {
      id: 3,
      title: "看电影",
      description: "选择一部你们都喜欢的电影，依偎在沙发上观看",
      icon: "🎬",
      type: "date",
      loveBoost: 12
    },
    {
      id: 4,
      title: "写情书",
      description: "给对方写一封真诚的情书，表达你的爱意",
      icon: "💌",
      type: "surprise",
      loveBoost: 25
    },
    {
      id: 5,
      title: "户外散步",
      description: "手牵手在公园里漫步，享受美好时光",
      icon: "🚶‍♂️",
      type: "together",
      loveBoost: 10
    },
    {
      id: 6,
      title: "分享回忆",
      description: "一起翻看照片，回忆美好的过往时光",
      icon: "📷",
      type: "communication",
      loveBoost: 18
    },
    {
      id: 7,
      title: "准备惊喜",
      description: "为对方准备一个小惊喜，让TA感受到你的心意",
      icon: "🎁",
      type: "surprise",
      loveBoost: 22
    },
    {
      id: 8,
      title: "学新技能",
      description: "一起学习一项新技能，比如跳舞或者画画",
      icon: "💃",
      type: "together",
      loveBoost: 16
    }
  ];

  const getLoveLevel = (index: number, analysisLevel?: string) => {
    // 如果有AI分析结果，优先使用
    if (analysisLevel) {
      const levelColors: { [key: string]: { color: string; emoji: string } } = {
        "热恋期": { color: "#FF1493", emoji: "💕" },
        "甜蜜期": { color: "#FF69B4", emoji: "💖" },
        "稳定期": { color: "#FFA500", emoji: "💛" },
        "磨合期": { color: "#87CEEB", emoji: "💙" },
        "困难期": { color: "#FF6347", emoji: "💔" },
        "危机期": { color: "#DC143C", emoji: "⚠️" },
        "破裂边缘": { color: "#8B0000", emoji: "💥" }
      };

      return {
        level: analysisLevel,
        color: levelColors[analysisLevel]?.color || "#87CEEB",
        emoji: levelColors[analysisLevel]?.emoji || "💙"
      };
    }

    // 降级到基于分数的判断
    if (index >= 90) return { level: "热恋期", color: "#FF1493", emoji: "💕" };
    if (index >= 75) return { level: "甜蜜期", color: "#FF69B4", emoji: "💖" };
    if (index >= 60) return { level: "稳定期", color: "#FFA500", emoji: "💛" };
    if (index >= 45) return { level: "磨合期", color: "#87CEEB", emoji: "💙" };
    if (index >= 30) return { level: "困难期", color: "#FF6347", emoji: "💔" };
    if (index >= 15) return { level: "危机期", color: "#DC143C", emoji: "⚠️" };
    return { level: "破裂边缘", color: "#8B0000", emoji: "💥" };
  };

  const loveLevel = getLoveLevel(loveIndex, loveAnalysis?.loveLevel);

  // 加载中显示专用加载页面
  if (isLoading) {
    return <LoveIndexLoading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 好感度仪表盘 */}
        <div className={styles.loveIndexSection}>
          <h2 className={styles.sectionTitle}>
            💕 爱情指数检测
          </h2>
          <p className={styles.subtitle}>分析你们关系的甜蜜指数</p>

          <div className={styles.loveometer}>
            <div className={styles.heart}>
              💖
            </div>

            <div className={styles.circleArea}>
              <div className={styles.indexDisplay}>
                <div className={styles.indexNumber}>{Math.round(loveIndex)}</div>
                <div className={styles.indexUnit}>%</div>
              </div>

              <div className={styles.progressRing}>
                <svg className={styles.progressSvg} viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={styles.progressBackground}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={styles.progressBar}
                    style={{
                      strokeDasharray: `${2 * Math.PI * 40}`,
                      strokeDashoffset: `${2 * Math.PI * 40 * (1 - loveIndex / 100)}`,
                      stroke: loveLevel.color
                    }}
                  />
                </svg>
              </div>
            </div>

            <div className={styles.loveStatus}>
              <span className={styles.loveLevel} style={{ color: loveLevel.color }}>
                {loveLevel.emoji} {loveLevel.level}
              </span>
            </div>
          </div>
        </div>

        {/* AI分析结果 */}
        {showActivities && loveAnalysis && (
          <div className={styles.analysisSection}>
            <h2 className={styles.sectionTitle}>
              🤖 AI智能分析
            </h2>
            <p className={styles.subtitle}>基于你们的争吵情况进行的专业分析</p>

            <div className={styles.analysisContent}>
              <div className={styles.reasoningBox}>
                <h3 className={styles.analysisSubTitle}>📊 评分依据</h3>
                <p className={styles.reasoningText}>{loveAnalysis.reasoning}</p>
              </div>

              <div className={styles.factorsGrid}>
                <div className={styles.factorsBox}>
                  <h3 className={styles.analysisSubTitle}>🎯 关键因素</h3>
                  <ul className={styles.factorsList}>
                    {loveAnalysis.mainFactors.map((factor, index) => (
                      <li key={index} className={styles.factorItem}>
                        <span className={styles.factorIcon}>
                          {index === 0 ? '✅' : index === 1 ? '⚠️' : '💡'}
                        </span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.suggestionBox}>
                  <h3 className={styles.analysisSubTitle}>💝 改善建议</h3>
                  <ul className={styles.suggestionsList}>
                    {loveAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className={styles.suggestionItem}>
                        <span className={styles.suggestionIcon}>💡</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 活动推荐 */}
        {showActivities && (
          <div className={styles.activitiesSection}>
            <h2 className={styles.sectionTitle}>
              ⭐ 增进感情活动推荐
            </h2>
            <p className={styles.subtitle}>完成这些活动可以提升你们的爱情指数哦！</p>

            <div className={styles.activitiesGrid}>
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={styles.activityCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.activityIcon}>{activity.icon}</div>
                  <h3 className={styles.activityTitle}>{activity.title}</h3>
                  <p className={styles.activityDescription}>{activity.description}</p>
                  <div className={styles.loveBoost}>
                    +{activity.loveBoost} 爱情值 💖
                  </div>
                  <div className={styles.activityType}>
                    {activity.type === 'date' && <>🌟 约会类</>}
                    {activity.type === 'communication' && <>💬 沟通类</>}
                    {activity.type === 'surprise' && <>🎁 惊喜类</>}
                    {activity.type === 'together' && <>👫 共同类</>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 爱情贴士 */}
        {showActivities && (
          <div className={styles.tipsSection}>
            <h2 className={styles.sectionTitle}>
              💡 爱情小贴士
            </h2>
            <div className={styles.tips}>
              <div className={styles.tip}>
                <span className={styles.tipIcon}>🌈</span>
                <span>多一些理解，少一些指责</span>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipIcon}>💬</span>
                <span>经常表达爱意，不要藏在心里</span>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipIcon}>🤗</span>
                <span>拥抱的力量比言语更强大</span>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipIcon}>⏰</span>
                <span>高质量的陪伴胜过长时间相处</span>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className={styles.actions}>
          <button className={styles.backButton} onClick={onBack}>
            重新测试
          </button>
          <button
            className={styles.shareButton}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: '汪汪法庭判决结果',
                  text: `我们的爱情指数是${Math.round(loveIndex)}%，处于${loveLevel.level}！`,
                  url: window.location.href
                });
              } else {
                // 复制到剪贴板的兜底方案
                navigator.clipboard?.writeText(
                  `我们的爱情指数是${Math.round(loveIndex)}%，处于${loveLevel.level}！`
                );
                alert('结果已复制到剪贴板！');
              }
            }}
          >
            分享结果
          </button>
          <button className={styles.historyButton} onClick={onHistory}>
            📚 历史裁决
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoveIndex;