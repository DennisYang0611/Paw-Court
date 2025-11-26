import React, { useEffect, useState } from 'react';
import styles from './LoveIndexLoading.module.css';
import { HeartIcon, SearchIcon, LightBulbIcon } from './SVGIcons';

const LoveIndexLoading = () => {
  const [clickEffects, setClickEffects] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  // 爱情相关的emoji数组
  const loveEmojis = ['💕', '💖', '💘', '💝', '💗', '💓', '💞', '💟', '❤️', '🌹', '💐', '🎁', '✨', '💫'];

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const randomEmoji = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];

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
        <div className={styles.doctorImageContainer}>
          <img src="/img/image.png" alt="米粒医生分析中" className={styles.doctorImage} />
          <div className={styles.stethoscope}>
            <div className={styles.heartIcon}>💗</div>
          </div>
        </div>

        <div className={styles.loadingText}>
          <h2>米粒医生分析中...</h2>
          <div className={styles.loadingDots}>
            <span>正</span>
            <span>在</span>
            <span>评</span>
            <span>估</span>
            <span>你</span>
            <span>们</span>
            <span>的</span>
            <span>爱</span>
            <span>情</span>
            <span>指</span>
            <span>数</span>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>

        <div className={styles.clickHint}>
          <span>点击屏幕任意位置释放爱意 💖</span>
          <div className={styles.clickAnimation}>👆</div>
        </div>

        <div className={styles.loadingTips}>
          <div className={styles.tip}>
            <HeartIcon size={24} className={styles.tipIcon} />
            <span>分析你们的感情基础...</span>
          </div>
          <div className={styles.tip}>
            <SearchIcon size={24} className={styles.tipIcon} />
            <span>评估沟通和理解程度...</span>
          </div>
          <div className={styles.tip}>
            <LightBulbIcon size={24} className={styles.tipIcon} />
            <span>制定个性化改善建议...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoveIndexLoading;