'use client';

import React, { useState, useEffect } from 'react';
import styles from './JuryPanel.module.css';
import { generateDeviceFingerprint } from '@/utils/clientUtils';

interface JuryPanelProps {
  verdictId: string;
  person1Name: string;
  person2Name: string;
  onVoteSuccess?: () => void;
  isFloating?: boolean;
}

interface JuryStats {
  totalVotes: number;
  person1Votes: number;
  person2Votes: number;
  person1Percentage: number;
  person2Percentage: number;
}

interface Comment {
  _id: string;
  comment: string;
  supportSide: 'person1' | 'person2' | 'neutral';
  timestamp: string;
}

const JuryPanel: React.FC<JuryPanelProps> = ({
  verdictId,
  person1Name,
  person2Name,
  onVoteSuccess,
  isFloating = false
}) => {
  const [stats, setStats] = useState<JuryStats | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentSide, setCommentSide] = useState<'person1' | 'person2' | 'neutral'>('neutral');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [showFloatingVoting, setShowFloatingVoting] = useState(false);
  const [floatingEnabled, setFloatingEnabled] = useState(true);

  useEffect(() => {
    const fingerprint = generateDeviceFingerprint();
    setDeviceFingerprint(fingerprint);
    loadJuryData(fingerprint);
  }, [verdictId]);

  // 悬浮投票显示逻辑 - 始终显示在底部
  useEffect(() => {
    if (isFloating && floatingEnabled && !voted) {
      setShowFloatingVoting(true);
    } else {
      setShowFloatingVoting(false);
    }
  }, [isFloating, floatingEnabled, voted]);

  const loadJuryData = async (fingerprint: string) => {
    try {
      // 加载投票统计
      const statsRes = await fetch(`/api/verdicts/${verdictId}/jury/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 检查是否已投票
      const voteRes = await fetch(
        `/api/verdicts/${verdictId}/jury/vote?deviceFingerprint=${fingerprint}`
      );
      if (voteRes.ok) {
        const voteData = await voteRes.json();
        if (voteData.voted) {
          setVoted(voteData.supportSide);
        }
      }

      // 加载评论
      const commentsRes = await fetch(`/api/verdicts/${verdictId}/jury/comments`);
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments);
      }
    } catch (error) {
      console.error('Failed to load jury data:', error);
    }
  };

  const handleVote = async (side: 'person1' | 'person2') => {
    if (voted) {
      setError('您已经投过票了');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/verdicts/${verdictId}/jury/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supportSide: side,
          deviceFingerprint,
        }),
      });

      if (response.ok) {
        setVoted(side);
        await loadJuryData(deviceFingerprint);
        if (onVoteSuccess) {
          onVoteSuccess();
        }
      } else {
        const data = await response.json();
        setError(data.error || '投票失败');
      }
    } catch (error) {
      setError('投票失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || newComment.trim().length < 5) {
      setError('评论内容至少需要5个字符');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/verdicts/${verdictId}/jury/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newComment.trim(),
          supportSide: commentSide,
          deviceFingerprint,
        }),
      });

      if (response.ok) {
        setNewComment('');
        setShowCommentForm(false);
        await loadJuryData(deviceFingerprint);
      } else {
        const data = await response.json();
        setError(data.error || '评论提交失败');
      }
    } catch (error) {
      setError('评论提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getSideName = (side: string) => {
    if (side === 'person1') return person1Name;
    if (side === 'person2') return person2Name;
    return '中立';
  };

  return (
    <>
      <div className={styles.juryPanel}>
        <div className={styles.header}>
          {isFloating && (
            <div className={styles.floatingToggleTop}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={floatingEnabled}
                  onChange={(e) => setFloatingEnabled(e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleText}>悬浮投票</span>
              </label>
            </div>
          )}
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h3>陪审团投票</h3>
              <p className={styles.subtitle}>看看其他人是怎么想的</p>
            </div>
          </div>
        </div>

        {/* 投票区域 */}
        {stats && (
          <div className={styles.votingArea}>
            <div className={styles.voteStats}>
              <div className={styles.totalVotes}>
                共 {stats.totalVotes} 人参与投票
              </div>

              {/* 进度条 - 类似美团小法庭 */}
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${styles.person1}`}
                    style={{ width: `${stats.person1Percentage}%` }}
                  >
                    {stats.person1Percentage > 10 && (
                      <span>{stats.person1Percentage}%</span>
                    )}
                  </div>
                  <div
                    className={`${styles.progressFill} ${styles.person2}`}
                    style={{ width: `${stats.person2Percentage}%` }}
                  >
                    {stats.person2Percentage > 10 && (
                      <span>{stats.person2Percentage}%</span>
                    )}
                  </div>
                </div>

                <div className={styles.progressLabels}>
                  <div className={styles.labelLeft}>
                    <span className={styles.personName}>{person1Name}</span>
                    <span className={styles.voteCount}>{stats.person1Votes}票</span>
                  </div>
                  <div className={styles.labelRight}>
                    <span className={styles.personName}>{person2Name}</span>
                    <span className={styles.voteCount}>{stats.person2Votes}票</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 投票按钮 */}
            {!voted ? (
              <div className={styles.voteButtons}>
                <button
                  className={`${styles.voteButton} ${styles.votePerson1}`}
                  onClick={() => handleVote('person1')}
                  disabled={loading}
                >
                  你认为 {person1Name} 错的多
                </button>
                <button
                  className={`${styles.voteButton} ${styles.votePerson2}`}
                  onClick={() => handleVote('person2')}
                  disabled={loading}
                >
                  你认为 {person2Name} 错的多
                </button>
              </div>
            ) : (
              <div className={styles.votedMessage}>
                您认为 <strong>{voted === 'person1' ? person1Name : person2Name}</strong> 错的多
              </div>
            )}
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {/* 评论区域 */}
        <div className={styles.commentsSection}>
          <div className={styles.commentsHeader}>
            <h4>陪审团评论 ({comments.length})</h4>
            {!showCommentForm && (
              <button
                className={styles.addCommentBtn}
                onClick={() => setShowCommentForm(true)}
              >
                发表观点
              </button>
            )}
          </div>

          {/* 评论表单 */}
          {showCommentForm && (
            <form className={styles.commentForm} onSubmit={handleSubmitComment}>
              <textarea
                className={styles.commentInput}
                placeholder="说说你的看法..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <div className={styles.commentFormFooter}>
                <div className={styles.supportSideSelector}>
                  <label>我的立场：</label>
                  <select
                    value={commentSide}
                    onChange={(e) => setCommentSide(e.target.value as any)}
                  >
                    <option value="neutral">中立</option>
                    <option value="person1">支持{person1Name}</option>
                    <option value="person2">支持{person2Name}</option>
                  </select>
                </div>
                <div className={styles.commentFormActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowCommentForm(false);
                      setNewComment('');
                      setError('');
                    }}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || newComment.trim().length < 5}
                  >
                    发表
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 评论列表 */}
          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <div className={styles.noComments}>
                暂无评论，快来发表你的观点吧！
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>游客</span>
                    <span
                      className={`${styles.commentSide} ${
                        styles[`side${comment.supportSide}`]
                      }`}
                    >
                      {getSideName(comment.supportSide)}
                    </span>
                    <span className={styles.commentTime}>
                      {new Date(comment.timestamp).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className={styles.commentContent}>{comment.comment}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 悬浮投票面板 - 仅包含投票功能 */}
      {isFloating && showFloatingVoting && stats && (
        <div className={styles.floatingVotePanel}>
          <div className={styles.floatingContent}>
            <div className={styles.floatingHeader}>
              <h4>快速投票</h4>
              <button
                className={styles.closeFloating}
                onClick={() => setFloatingEnabled(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.floatingStats}>
              <div className={styles.miniProgressBar}>
                <div
                  className={`${styles.miniProgressFill} ${styles.person1}`}
                  style={{ width: `${stats.person1Percentage}%` }}
                >
                  {stats.person1Percentage > 15 && (
                    <span>{stats.person1Percentage}%</span>
                  )}
                </div>
                <div
                  className={`${styles.miniProgressFill} ${styles.person2}`}
                  style={{ width: `${stats.person2Percentage}%` }}
                >
                  {stats.person2Percentage > 15 && (
                    <span>{stats.person2Percentage}%</span>
                  )}
                </div>
              </div>
              <div className={styles.miniLabels}>
                <span>{person1Name} {stats.person1Votes}票</span>
                <span>{person2Name} {stats.person2Votes}票</span>
              </div>
            </div>

            <div className={styles.floatingVoteButtons}>
              <button
                className={`${styles.floatingVoteBtn} ${styles.votePerson1}`}
                onClick={() => handleVote('person1')}
                disabled={loading}
              >
                {person1Name} 错的多
              </button>
              <button
                className={`${styles.floatingVoteBtn} ${styles.votePerson2}`}
                onClick={() => handleVote('person2')}
                disabled={loading}
              >
                {person2Name} 错的多
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JuryPanel;