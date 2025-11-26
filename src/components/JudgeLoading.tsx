import React, { useEffect, useState } from 'react';
import styles from './JudgeLoading.module.css';
import { ScaleIcon, SearchIcon, LightBulbIcon } from './SVGIcons';

const JudgeLoading = () => {
  const [clickEffects, setClickEffects] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  // 法院相关的emoji数组
  const courtEmojis = ['⚖️', '👨‍⚖️', '👩‍⚖️', '🏛️', '📋', '⚡', '💼', '🔨', '📜', '🎯'];

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const randomEmoji = courtEmojis[Math.floor(Math.random() * courtEmojis.length)];

    const newEffect = {
      id: Date.now() + Math.random(),
      x,
      y,
      emoji: randomEmoji
    };

    setClickEffects(prev => [...prev, newEffect]);

    // 1秒后移除动画效果
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 1000);
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      {/* 点击动画效果 */}
      {clickEffects.map((effect) => (
        <div
          key={effect.id}
          className={styles.clickEffect}
          style={{
            left: effect.x,
            top: effect.y,
          }}
        >
          {effect.emoji}
        </div>
      ))}

      <div className={styles.loadingContent}>
        <div className={styles.judgeImageContainer}>
          <img src="/judge-dog.png" alt="审判中的法官米粒" className={styles.judgeImage} />
          <div className={styles.gavel}>
            <div className={styles.hammerIcon}>⚖️</div>
          </div>
        </div>

        <div className={styles.loadingText}>
          <h2>法官米粒审理中...</h2>
          <div className={styles.loadingDots}>
            <span>正</span>
            <span>在</span>
            <span>仔</span>
            <span>细</span>
            <span>分</span>
            <span>析</span>
            <span>案</span>
            <span>情</span>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>

        <div className={styles.clickHint}>
          <span>点击屏幕任意位置 ✨</span>
          <div className={styles.clickAnimation}>👆</div>
        </div>

        <div className={styles.loadingTips}>
          <div className={styles.tip}>
            <ScaleIcon size={24} className={styles.tipIcon} />
            <span>正在权衡双方的观点...</span>
          </div>
          <div className={styles.tip}>
            <SearchIcon size={24} className={styles.tipIcon} />
            <span>分析争执的根本原因...</span>
          </div>
          <div className={styles.tip}>
            <LightBulbIcon size={24} className={styles.tipIcon} />
            <span>寻找最佳解决方案...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeLoading;