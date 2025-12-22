export const zhCN = {
  common: {
    back: '返回',
    loading: '加载中...',
    submit: '提交',
    cancel: '取消',
    confirm: '确认',
    history: '历史',
    detail: '详情',
    close: '关闭'
  },
  homepage: {
    title: '汪汪法庭',
    subtitle: '公正、温暖的纠纷解决平台',
    judgeName: '法官米粒',
    newFeatureBadge: 'NEW',
    newFeatureNotice: '🎉 陪审团功能已上线！现在可以在历史记录中看到其他用户的观点和投票啦！',
    submitButton: '提交给法官审理',
    person1: '当事人甲',
    person2: '当事人乙',
    nameLabel: '姓名/昵称',
    namePlaceholder: '请输入姓名或昵称',
    storyLabel: '事情经过',
    storyPlaceholder: '详细描述一下发生了什么事情...',
    complaintLabel: '委屈的点',
    complaintPlaceholder: '说说你觉得委屈的地方...',
    // 新增模式选择
    modeJuryTitle: '模拟陪审团：共判经典案例',
    modeJuryDesc: '化身陪审成员，围观真实历史案件，用投票 + 讨论表达你的观点',
    modeSubmitTitle: '一键提交纠纷：AI 法官帮你理清楚',
    modeSubmitDesc: '填写你的纠纷细节，AI 法官秒出分析 + 解决方案',
    // 功能标签
    featureSmartAssign: '智能派案',
    featureVoteStance: '票选立场',
    featureGroupDiscussion: '案件研讨',
    featureSimpleForm: '极简填单',
    featureAiAnalysis: 'AI拆解',
    featurePracticalSolution: '解决方案'
  },
  historyVerdicts: {
    title: '📚 历史裁决',
    subtitle: '查看汪汪法庭的历史判决案例',
    backToList: '← 返回列表',
    detailTitle: '判决详情',
    caseNumber: '案件编号',
    parties: '当事人',
    responsibility: '责任分配',
    analysis: '案件分析',
    verdict: '法庭判决',
    solutions: '解决方案',
    viewDetail: '查看详情',
    prevPage: '上一页',
    nextPage: '下一页',
    pageInfo: '第 {current} 页 / 共 {total} 页',
    storyLabel: '事情经过：',
    complaintLabel: '委屈诉求：',
    solutionFor: '{name}的解决方案'
  },
  voting: {
    like: '👍 赞同',
    dislike: '👎 不赞同',
    likeShort: '赞同',
    dislikeShort: '不赞同',
    withdraw: '撤回',
    withdrawVote: '撤回投票',
    voted: '已投票',
    votedStatus: '您已{type}此判决',
    votedLike: '赞同',
    votedDislike: '反对',
    voteStats: '{likes} 赞同 · {dislikes} 反对'
  },
  jury: {
    title: '陪审团观点',
    subtitle: '看看其他用户怎么看这个案件',
    voteFor: '我支持',
    reasonPlaceholder: '说说你的理由...',
    submitVote: '提交投票',
    commentPlaceholder: '发表你的看法...',
    submitComment: '发布评论',
    totalVotes: '{count}人参与投票',
    noComments: '暂无评论，来发表第一个观点吧！',
    supportSide: '支持 {name}',
    neutralSide: '中立观点',
    juryStats: '陪审团观点：',
    votedFor: '已投票支持：{name}',
    person1Percentage: '{name}: {percentage}%',
    person2Percentage: '{name}: {percentage}%'
  },
  errors: {
    networkError: '网络错误，请稍后重试',
    submitError: '提交失败，请稍后重试',
    loadError: '加载失败，请刷新页面',
    voteError: '投票失败，请稍后重试',
    alreadyVoted: '您已经投过票了',
    invalidInput: '请填写完整信息'
  },
  loveIndex: {
    title: '恋爱指数分析',
    subtitle: '基于本次裁决分析你们的恋爱指数',
    score: '恋爱指数',
    analysis: '分析结果',
    suggestions: '改善建议',
    backToHome: '回到首页',
    viewHistory: '查看历史记录'
  }
};

export type Translations = typeof zhCN;