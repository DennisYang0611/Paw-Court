import { Translations } from './zh-CN';

export const en: Translations = {
  common: {
    back: 'Back',
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    history: 'History',
    detail: 'Detail',
    close: 'Close'
  },
  homepage: {
    title: 'Woof Woof Court',
    subtitle: 'Fair and Warm Dispute Resolution Platform',
    judgeName: 'Judge Milly',
    newFeatureBadge: 'NEW',
    newFeatureNotice: '🎉 Jury feature is now live! You can now see other users\' opinions and votes in the history!',
    submitButton: 'Submit to Judge',
    person1: 'Party A',
    person2: 'Party B',
    nameLabel: 'Name/Nickname',
    namePlaceholder: 'Enter name or nickname',
    storyLabel: 'What Happened',
    storyPlaceholder: 'Describe in detail what happened...',
    complaintLabel: 'Your Grievances',
    complaintPlaceholder: 'Tell us what you feel wronged about...',
    // Mode selection
    modeJuryTitle: 'Jury Mode: Judge Classic Cases',
    modeJuryDesc: 'Become a jury member, review real historical cases, and express your views through voting and discussion',
    modeSubmitTitle: 'Submit Dispute: AI Judge Helps You Figure It Out',
    modeSubmitDesc: 'Fill in your dispute details, AI judge provides instant analysis + solutions',
    // Feature tags
    featureSmartAssign: 'Smart Assignment',
    featureVoteStance: 'Vote Stance',
    featureGroupDiscussion: 'Group Discussion',
    featureSimpleForm: 'Simple Form',
    featureAiAnalysis: 'AI Analysis',
    featurePracticalSolution: 'Solutions'
  },
  historyVerdicts: {
    title: '📚 Historical Verdicts',
    subtitle: 'Browse past court decisions from Woof Woof Court',
    backToList: '← Back to List',
    detailTitle: 'Verdict Details',
    caseNumber: 'Case Number',
    parties: 'Parties',
    responsibility: 'Responsibility Distribution',
    analysis: 'Case Analysis',
    verdict: 'Court Verdict',
    solutions: 'Solutions',
    viewDetail: 'View Details',
    prevPage: 'Previous',
    nextPage: 'Next',
    pageInfo: 'Page {current} of {total}',
    storyLabel: 'What happened: ',
    complaintLabel: 'Grievances: ',
    solutionFor: 'Solutions for {name}'
  },
  voting: {
    like: '👍 Agree',
    dislike: '👎 Disagree',
    likeShort: 'Agree',
    dislikeShort: 'Disagree',
    withdraw: 'Withdraw',
    withdrawVote: 'Withdraw Vote',
    voted: 'Voted',
    votedStatus: 'You have {type} this verdict',
    votedLike: 'agreed with',
    votedDislike: 'disagreed with',
    voteStats: '{likes} Agree · {dislikes} Disagree'
  },
  jury: {
    title: 'Jury Opinions',
    subtitle: 'See what other users think about this case',
    voteFor: 'I support',
    reasonPlaceholder: 'Share your reasoning...',
    submitVote: 'Submit Vote',
    commentPlaceholder: 'Share your thoughts...',
    submitComment: 'Post Comment',
    totalVotes: '{count} people voted',
    noComments: 'No comments yet, be the first to share your opinion!',
    supportSide: 'Support {name}',
    neutralSide: 'Neutral Opinion',
    juryStats: 'Jury Opinion: ',
    votedFor: 'Voted for: {name}',
    person1Percentage: '{name}: {percentage}%',
    person2Percentage: '{name}: {percentage}%'
  },
  errors: {
    networkError: 'Network error, please try again later',
    submitError: 'Submission failed, please try again later',
    loadError: 'Loading failed, please refresh the page',
    voteError: 'Vote failed, please try again later',
    alreadyVoted: 'You have already voted',
    invalidInput: 'Please fill in all required information'
  },
  loveIndex: {
    title: 'Love Index Analysis',
    subtitle: 'Analyze your love compatibility based on this verdict',
    score: 'Love Index',
    analysis: 'Analysis Results',
    suggestions: 'Suggestions for Improvement',
    backToHome: 'Back to Home',
    viewHistory: 'View History'
  }
};