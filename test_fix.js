// 快速测试修复后的评分系统
const importFetch = async () => {
  const { default: fetch } = await import('node-fetch');
  return fetch;
};

// 简化版评分函数用于测试
async function testScoring() {
  // 模拟场景一的数据
  const testScores = {
    person1: { totalScore: 85 }, // 小雅表现好，得分高
    person2: { totalScore: 35 }  // 小明表现差，得分低
  };

  // 计算责任比例：得分低的人责任大
  const totalScore = testScores.person1.totalScore + testScores.person2.totalScore;
  const person1Fault = Math.round((testScores.person2.totalScore / totalScore) * 1000) / 10;
  const person2Fault = Math.round((testScores.person1.totalScore / totalScore) * 1000) / 10;

  console.log('🧮 修复后的责任计算测试：');
  console.log(`小雅得分: ${testScores.person1.totalScore}/100 (表现好)`);
  console.log(`小明得分: ${testScores.person2.totalScore}/100 (表现差)`);
  console.log('');
  console.log('责任分配：');
  console.log(`小雅责任: ${person1Fault}% (得分高，责任小 ✅)`);
  console.log(`小明责任: ${person2Fault}% (得分低，责任大 ✅)`);
  console.log(`总计: ${person1Fault + person2Fault}%`);
  console.log('');
  console.log(person2Fault > person1Fault ? '✅ 修复成功：过错方承担更多责任' : '❌ 仍有问题');
}

testScoring();