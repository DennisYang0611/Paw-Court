import { Translations } from './zh-CN';

export const zhTW: Translations = {
  common: {
    back: '返回',
    loading: '載入中...',
    submit: '提交',
    cancel: '取消',
    confirm: '確認',
    history: '歷史',
    detail: '詳情',
    close: '關閉'
  },
  homepage: {
    title: '汪汪法庭',
    subtitle: '公正、溫暖的糾紛解決平台',
    judgeName: '法官米粒',
    newFeatureBadge: 'NEW',
    newFeatureNotice: '🎉 陪審團功能已上線！現在可以在歷史記錄中看到其他用戶的觀點和投票啦！',
    submitButton: '提交給法官審理',
    person1: '當事人甲',
    person2: '當事人乙',
    nameLabel: '姓名/暱稱',
    namePlaceholder: '請輸入姓名或暱稱',
    storyLabel: '事情經過',
    storyPlaceholder: '詳細描述一下發生了什麼事情...',
    complaintLabel: '委屈的點',
    complaintPlaceholder: '說說你覺得委屈的地方...',
    // 新增模式選擇
    modeJuryTitle: '模擬陪審團：共判經典案例',
    modeJuryDesc: '化身陪審成員，圍觀真實歷史案件，用投票 + 討論表達你的觀點',
    modeSubmitTitle: '一鍵提交糾紛：AI 法官幫你理清楚',
    modeSubmitDesc: '填寫你的糾紛細節，AI 法官秒出分析 + 解決方案',
    // 功能標籤
    featureSmartAssign: '智能派案',
    featureVoteStance: '票選立場',
    featureGroupDiscussion: '案件研討',
    featureSimpleForm: '極簡填單',
    featureAiAnalysis: 'AI拆解',
    featurePracticalSolution: '解決方案'
  },
  historyVerdicts: {
    title: '📚 歷史裁決',
    subtitle: '查看汪汪法庭的歷史判決案例',
    backToList: '← 返回列表',
    detailTitle: '判決詳情',
    caseNumber: '案件編號',
    parties: '當事人',
    responsibility: '責任分配',
    analysis: '案件分析',
    verdict: '法庭判決',
    solutions: '解決方案',
    viewDetail: '查看詳情',
    prevPage: '上一頁',
    nextPage: '下一頁',
    pageInfo: '第 {current} 頁 / 共 {total} 頁',
    storyLabel: '事情經過：',
    complaintLabel: '委屈訴求：',
    solutionFor: '{name}的解決方案'
  },
  voting: {
    like: '👍 贊同',
    dislike: '👎 不贊同',
    likeShort: '贊同',
    dislikeShort: '不贊同',
    withdraw: '撤回',
    withdrawVote: '撤回投票',
    voted: '已投票',
    votedStatus: '您已{type}此判決',
    votedLike: '贊同',
    votedDislike: '反對',
    voteStats: '{likes} 贊同 · {dislikes} 反對'
  },
  jury: {
    title: '陪審團觀點',
    subtitle: '看看其他用戶怎麼看這個案件',
    voteFor: '我支持',
    reasonPlaceholder: '說說你的理由...',
    submitVote: '提交投票',
    commentPlaceholder: '發表你的看法...',
    submitComment: '發布評論',
    totalVotes: '{count}人參與投票',
    noComments: '暫無評論，來發表第一個觀點吧！',
    supportSide: '支持 {name}',
    neutralSide: '中立觀點',
    juryStats: '陪審團觀點：',
    votedFor: '已投票支持：{name}',
    person1Percentage: '{name}: {percentage}%',
    person2Percentage: '{name}: {percentage}%'
  },
  errors: {
    networkError: '網路錯誤，請稍後重試',
    submitError: '提交失敗，請稍後重試',
    loadError: '載入失敗，請重新整理頁面',
    voteError: '投票失敗，請稍後重試',
    alreadyVoted: '您已經投過票了',
    invalidInput: '請填寫完整資訊'
  },
  loveIndex: {
    title: '戀愛指數分析',
    subtitle: '基於本次裁決分析你們的戀愛指數',
    score: '戀愛指數',
    analysis: '分析結果',
    suggestions: '改善建議',
    backToHome: '回到首頁',
    viewHistory: '查看歷史記錄'
  }
};