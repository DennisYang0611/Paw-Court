import React, { useState, useEffect } from 'react';
import styles from './HistoryVerdicts.module.css';
import { generateDeviceFingerprint } from '../utils/clientUtils';
import { useTranslation } from '../contexts/I18nContext';
import JuryPanel from './JuryPanel';

interface HistoryVerdictsProps {
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
  juryStats?: {
    totalVotes: number;
    person1Votes: number;
    person2Votes: number;
    person1Percentage: number;
    person2Percentage: number;
  };
}

interface VerdictResponse {
  verdicts: VerdictItem[];
  total: number;
  page: number;
  totalPages: number;
}

const HistoryVerdicts: React.FC<HistoryVerdictsProps> = ({ onBack }) => {
  const { t, formatMessage } = useTranslation();
  const [verdicts, setVerdicts] = useState<VerdictItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedVerdict, setSelectedVerdict] = useState<VerdictItem | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [userVotes, setUserVotes] = useState<{ [key: string]: string | null }>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [jumpToPage, setJumpToPage] = useState<string>('');

  useEffect(() => {
    const fingerprint = generateDeviceFingerprint();
    setDeviceFingerprint(fingerprint);
  }, []);

  useEffect(() => {
    fetchVerdicts();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (deviceFingerprint && verdicts.length > 0) {
      checkVoteStatuses();
    }
  }, [deviceFingerprint, verdicts]);

  // 清理函数，组件卸载时重置状态
  useEffect(() => {
    return () => {
      setUserVotes({});
    };
  }, []);

  const fetchVerdicts = async () => {
    try {
      const isSearching = searchTerm.trim().length > 0;
      setLoading(!isSearching);
      if (isSearching) {
        setSearchLoading(true);
      }

      const url = new URL('/api/verdicts/history', window.location.origin);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', '10');
      if (searchTerm.trim()) {
        url.searchParams.append('search', searchTerm.trim());
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch verdicts');

      const data: VerdictResponse = await response.json();

      // 为每个判决获取陪审团统计数据
      const verdictsWithJuryStats = await Promise.all(
        data.verdicts.map(async (verdict) => {
          try {
            const juryStatsResponse = await fetch(`/api/verdicts/${verdict._id}/jury/stats`);
            if (juryStatsResponse.ok) {
              const juryStats = await juryStatsResponse.json();
              return { ...verdict, juryStats };
            }
          } catch (error) {
            console.error('Failed to fetch jury stats for verdict:', verdict._id, error);
          }
          return verdict;
        })
      );

      setVerdicts(verdictsWithJuryStats);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Error fetching verdicts:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const checkVoteStatuses = async () => {
    if (!deviceFingerprint || verdicts.length === 0) return;

    try {
      const voteChecks = await Promise.all(
        verdicts.map(async (verdict) => {
          try {
            const voteResponse = await fetch(
              `/api/verdicts/${verdict._id}/vote?deviceFingerprint=${deviceFingerprint}`
            );
            if (voteResponse.ok) {
              const voteData = await voteResponse.json();
              return { id: verdict._id, voteType: voteData.voteType };
            }
          } catch (error) {
            console.error('Error checking vote:', error);
          }
          return { id: verdict._id, voteType: null };
        })
      );

      const voteMap = voteChecks.reduce((acc, { id, voteType }) => {
        acc[id] = voteType;
        return acc;
      }, {} as { [key: string]: string | null });

      setUserVotes(voteMap);
    } catch (error) {
      console.error('Error checking vote statuses:', error);
      // 如果检查失败，重置投票状态以避免显示错误的按钮
      setUserVotes({});
    }
  };

  const handleVote = async (verdictId: string, voteType: 'like' | 'dislike') => {
    if (!deviceFingerprint) return;

    try {
      const response = await fetch(`/api/verdicts/${verdictId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voteType,
          deviceFingerprint,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Vote failed');
      }

      // 立即更新本地投票状态
      setUserVotes(prev => ({ ...prev, [verdictId]: voteType }));

      // 更新投票数
      setVerdicts(prev => prev.map(verdict => {
        if (verdict._id === verdictId) {
          return {
            ...verdict,
            votes: {
              ...verdict.votes,
              likes: voteType === 'like' ? verdict.votes.likes + 1 : verdict.votes.likes,
              dislikes: voteType === 'dislike' ? verdict.votes.dislikes + 1 : verdict.votes.dislikes
            }
          };
        }
        return verdict;
      }));

      // 如果在详情页，也要更新
      if (selectedVerdict && selectedVerdict._id === verdictId) {
        setSelectedVerdict(prev => prev ? {
          ...prev,
          votes: {
            ...prev.votes,
            likes: voteType === 'like' ? prev.votes.likes + 1 : prev.votes.likes,
            dislikes: voteType === 'dislike' ? prev.votes.dislikes + 1 : prev.votes.dislikes
          }
        } : null);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleWithdrawVote = async (verdictId: string) => {
    if (!deviceFingerprint) return;

    const currentVote = userVotes[verdictId];
    if (!currentVote) return;

    try {
      const response = await fetch(`/api/verdicts/${verdictId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceFingerprint,
          withdraw: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Withdraw failed');
      }

      // 立即更新本地投票状态
      setUserVotes(prev => ({ ...prev, [verdictId]: null }));

      // 更新投票数
      setVerdicts(prev => prev.map(verdict => {
        if (verdict._id === verdictId) {
          return {
            ...verdict,
            votes: {
              ...verdict.votes,
              likes: currentVote === 'like' ? verdict.votes.likes - 1 : verdict.votes.likes,
              dislikes: currentVote === 'dislike' ? verdict.votes.dislikes - 1 : verdict.votes.dislikes
            }
          };
        }
        return verdict;
      }));

      // 如果在详情页，也要更新
      if (selectedVerdict && selectedVerdict._id === verdictId) {
        setSelectedVerdict(prev => prev ? {
          ...prev,
          votes: {
            ...prev.votes,
            likes: currentVote === 'like' ? prev.votes.likes - 1 : prev.votes.likes,
            dislikes: currentVote === 'dislike' ? prev.votes.dislikes - 1 : prev.votes.dislikes
          }
        } : null);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentPage(1); // 搜索时重置到第一页
    fetchVerdicts();
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    // 如果搜索框被清空，自动触发搜索
    if (value.trim() === '') {
      setCurrentPage(1);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpToPage('');
    } else {
      alert(`请输入1到${totalPages}之间的页码`);
    }
  };

  const handleJumpInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // 只允许输入数字
    if (/^\d*$/.test(value)) {
      setJumpToPage(value);
    }
  };

  const handleJumpKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleJumpToPage();
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getVoteButtonClass = (verdictId: string, voteType: 'like' | 'dislike') => {
    const userVote = userVotes[verdictId];
    if (userVote === voteType) {
      return voteType === 'like' ? styles.likeButtonActive : styles.dislikeButtonActive;
    }
    return voteType === 'like' ? styles.likeButton : styles.dislikeButton;
  };

  if (selectedVerdict) {
    return (
      <div className={styles.container}>
        <div className={styles.detailView}>
          <div className={styles.detailHeader}>
            <button className={styles.backButton} onClick={() => setSelectedVerdict(null)}>
              {t.historyVerdicts.backToList}
            </button>
            <h2 className={styles.detailTitle}>{t.historyVerdicts.detailTitle}</h2>
          </div>

          <div className={styles.verdictCard}>
            <div className={styles.caseHeader}>
              <h3>{t.historyVerdicts.caseNumber}：{selectedVerdict.caseId}</h3>
              <p className={styles.timestamp}>{formatDate(selectedVerdict.timestamp)}</p>
            </div>

            <div className={styles.parties}>
              <div className={styles.party}>
                <h4>当事人甲：{selectedVerdict.persons.person1.name}</h4>
                <p><strong>事情经过：</strong>{selectedVerdict.persons.person1.story}</p>
                <p><strong>委屈诉求：</strong>{selectedVerdict.persons.person1.complaint}</p>
              </div>
              <div className={styles.party}>
                <h4>当事人乙：{selectedVerdict.persons.person2.name}</h4>
                <p><strong>事情经过：</strong>{selectedVerdict.persons.person2.story}</p>
                <p><strong>委屈诉求：</strong>{selectedVerdict.persons.person2.complaint}</p>
              </div>
            </div>

            <div className={styles.analysis}>
              <h4>案件分析</h4>
              <p>{selectedVerdict.result.reason}</p>
            </div>

            <div className={styles.responsibility}>
              <h4>责任分配</h4>
              <div className={styles.responsibilitySplit}>
                <div className={styles.splitContainer}>
                  <div
                    className={styles.leftPerson}
                    style={{width: `${selectedVerdict.result.faultPercentage.person1}%`}}
                  >
                    <span className={styles.personLabel}>{selectedVerdict.persons.person1.name}</span>
                    <span className={styles.personPercentage}>{selectedVerdict.result.faultPercentage.person1}%</span>
                  </div>
                  <div
                    className={styles.rightPerson}
                    style={{width: `${selectedVerdict.result.faultPercentage.person2}%`}}
                  >
                    <span className={styles.personLabel}>{selectedVerdict.persons.person2.name}</span>
                    <span className={styles.personPercentage}>{selectedVerdict.result.faultPercentage.person2}%</span>
                  </div>
                </div>
                <div className={styles.splitLegend}>
                  <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{backgroundColor: 'var(--rose-gold)'}}></div>
                    <span>{selectedVerdict.persons.person1.name}</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{backgroundColor: 'var(--cream-dark)'}}></div>
                    <span>{selectedVerdict.persons.person2.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.verdict}>
              <h4>法庭判决</h4>
              <p>{selectedVerdict.result.verdict}</p>
            </div>

            <div className={styles.solutions}>
              <div className={styles.solution}>
                <h5>{selectedVerdict.persons.person1.name}的解决方案</h5>
                <ul>
                  {selectedVerdict.result.solutions.person1.map((solution, index) => (
                    <li key={index}>{solution}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.solution}>
                <h5>{selectedVerdict.persons.person2.name}的解决方案</h5>
                <ul>
                  {selectedVerdict.result.solutions.person2.map((solution, index) => (
                    <li key={index}>{solution}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.voteSection}>
              <div className={styles.voteStats}>
                <span>👍 {selectedVerdict.votes.likes}</span>
                <span>👎 {selectedVerdict.votes.dislikes}</span>
              </div>
              {!userVotes[selectedVerdict._id] && (
                <div className={styles.voteButtons}>
                  <button
                    className={styles.likeButton}
                    onClick={() => handleVote(selectedVerdict._id, 'like')}
                  >
                    👍 赞同
                  </button>
                  <button
                    className={styles.dislikeButton}
                    onClick={() => handleVote(selectedVerdict._id, 'dislike')}
                  >
                    👎 不赞同
                  </button>
                </div>
              )}
              {userVotes[selectedVerdict._id] && (
                <div className={styles.votedStatusDetail}>
                  <p className={styles.votedMessage}>
                    您已{userVotes[selectedVerdict._id] === 'like' ? '赞同' : '反对'}此判决
                  </p>
                  <button
                    className={styles.withdrawButtonDetail}
                    onClick={() => handleWithdrawVote(selectedVerdict._id)}
                  >
                    撤回投票
                  </button>
                </div>
              )}
            </div>

            {/* 陪审团面板 */}
            <JuryPanel
              verdictId={selectedVerdict._id}
              person1Name={selectedVerdict.persons.person1.name}
              person2Name={selectedVerdict.persons.person2.name}
              onVoteSuccess={() => {
                // 可以在这里添加投票成功后的回调逻辑
                console.log('Jury vote submitted successfully');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          {t.common.back}
        </button>
        <h1 className={styles.title}>{t.historyVerdicts.title}</h1>
        <p className={styles.subtitle}>{t.historyVerdicts.subtitle}</p>
      </div>

      <div className={styles.searchContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="搜索案例（当事人姓名、事情经过或标题）..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className={styles.clearButton}
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className={styles.searchButton}
            disabled={searchLoading}
          >
            {searchLoading ? '搜索中...' : '搜索'}
          </button>
        </form>
        {searchTerm && (
          <div className={styles.searchStatus}>
            {totalCount > 0 ? (
              <span>找到 {totalCount} 个相关案例</span>
            ) : (
              <span>未找到相关案例</span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <img
            src="/img/image copy.png"
            alt="Loading"
            className={styles.loadingDog}
          />
          <div className={styles.spinner}></div>
          <p>{t.common.loading}</p>
        </div>
      ) : (
        <>
          <div className={styles.verdictsList}>
            {verdicts.map((verdict) => (
              <div key={verdict._id} className={styles.verdictItem}>
                <div className={styles.verdictHeader}>
                  <h3>{verdict.title || verdict.caseId}</h3>
                  <span className={styles.date}>{formatDate(verdict.timestamp)}</span>
                </div>

                <div className={styles.verdictSummary}>
                  <p className={styles.summary}>
                    {verdict.summary || `${verdict.persons.person1.name} vs ${verdict.persons.person2.name}`}
                  </p>
                  <p className={styles.parties}>
                    当事人：{verdict.persons.person1.name}、{verdict.persons.person2.name}
                  </p>
                  <div className={styles.responsibilityPreview}>
                    <span className={styles.responsibilityLabel}>责任分配：</span>
                    <div className={styles.miniSplitContainer}>
                      <div
                        className={styles.miniLeftPerson}
                        style={{width: `${verdict.result.faultPercentage.person1}%`}}
                      >
                        <span className={styles.miniPersonLabel}>{verdict.persons.person1.name}</span>
                        <span className={styles.miniPersonPercentage}>{verdict.result.faultPercentage.person1}%</span>
                      </div>
                      <div
                        className={styles.miniRightPerson}
                        style={{width: `${verdict.result.faultPercentage.person2}%`}}
                      >
                        <span className={styles.miniPersonLabel}>{verdict.persons.person2.name}</span>
                        <span className={styles.miniPersonPercentage}>{verdict.result.faultPercentage.person2}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 陪审团投票预览 */}
                  {verdict.juryStats && verdict.juryStats.totalVotes > 0 && (
                    <div className={styles.juryPreview}>
                      <span className={styles.juryLabel}>陪审团观点：</span>
                      <div className={styles.juryVoteLabels}>
                        <span className={styles.juryPersonLabel}>
                          {verdict.persons.person1.name}: {verdict.juryStats.person1Percentage}%
                        </span>
                        <span className={styles.juryPersonLabel}>
                          {verdict.persons.person2.name}: {verdict.juryStats.person2Percentage}%
                        </span>
                      </div>
                      <div className={styles.miniJuryContainer}>
                        <div
                          className={styles.miniJuryPerson1}
                          style={{width: `${verdict.juryStats.person1Percentage}%`}}
                        >
                          {verdict.juryStats.person1Percentage > 20 && (
                            <span className={styles.miniJuryPercentage}>{verdict.juryStats.person1Percentage}%</span>
                          )}
                        </div>
                        <div
                          className={styles.miniJuryPerson2}
                          style={{width: `${verdict.juryStats.person2Percentage}%`}}
                        >
                          {verdict.juryStats.person2Percentage > 20 && (
                            <span className={styles.miniJuryPercentage}>{verdict.juryStats.person2Percentage}%</span>
                          )}
                        </div>
                      </div>
                      <span className={styles.juryCount}>
                        {verdict.juryStats.totalVotes}人参与投票
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.verdictActions}>
                  <button
                    className={styles.viewButton}
                    onClick={() => setSelectedVerdict(verdict)}
                  >
                    查看详情
                  </button>

                  <div className={styles.voteContainer}>
                    <div className={styles.voteStats}>
                      <span>👍 {verdict.votes.likes}</span>
                      <span>👎 {verdict.votes.dislikes}</span>
                    </div>

                    {!userVotes[verdict._id] && (
                      <div className={styles.voteButtons}>
                        <button
                          className={getVoteButtonClass(verdict._id, 'like')}
                          onClick={() => handleVote(verdict._id, 'like')}
                        >
                          👍 赞同
                        </button>
                        <button
                          className={getVoteButtonClass(verdict._id, 'dislike')}
                          onClick={() => handleVote(verdict._id, 'dislike')}
                        >
                          👎 不赞同
                        </button>
                      </div>
                    )}
                    {userVotes[verdict._id] && (
                      <div className={styles.votedStatus}>
                        <span className={styles.votedLabel}>
                          已投票: {userVotes[verdict._id] === 'like' ? '👍 赞同' : '👎 不赞同'}
                        </span>
                        <button
                          className={styles.withdrawButton}
                          onClick={() => handleWithdrawVote(verdict._id)}
                        >
                          撤回
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </button>

              <span className={styles.pageInfo}>
                第 {currentPage} 页 / 共 {totalPages} 页
              </span>

              <div className={styles.jumpToPage}>
                <input
                  type="text"
                  placeholder="页码"
                  value={jumpToPage}
                  onChange={handleJumpInputChange}
                  onKeyDown={handleJumpKeyPress}
                  className={styles.jumpInput}
                  maxLength={3}
                />
                <button
                  className={styles.jumpButton}
                  onClick={handleJumpToPage}
                  disabled={!jumpToPage}
                >
                  跳转
                </button>
              </div>

              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryVerdicts;