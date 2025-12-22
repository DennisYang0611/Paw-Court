import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb://root:4bsdgzhq@dbconn.sealoshzh.site:37634/?directConnection=true';
const DB_NAME = 'wangwang_court';

interface VerdictDocument {
  _id?: ObjectId;
  caseId: string;
  timestamp: Date;
  title: string;
  summary: string;
  persons: {
    person1: {
      name: string;
      story: string;
      complaint: string;
    };
    person2: {
      name: string;
      story: string;
      complaint: string;
    };
  };
  result: {
    reason: string;
    faultPercentage: {
      person1: number;
      person2: number;
    };
    verdict: string;
    solutions: {
      person1: string[];
      person2: string[];
    };
  };
  votes: {
    likes: number;
    dislikes: number;
    voters: string[]; // 存储设备指纹
  };
}

interface VoteDocument {
  verdictId: string;
  deviceFingerprint: string;
  voteType: 'like' | 'dislike';
  timestamp: Date;
}

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (!client || !db) {
    client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      db = client.db(DB_NAME);
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
  return db;
}

// 保存判决到数据库
export async function saveVerdict(formData: any, result: any): Promise<string> {
  try {
    const database = await connectToDatabase();
    const collection: Collection<VerdictDocument> = database.collection('verdicts');

    const caseId = `CP-${Date.now()}`;
    const verdictDoc: VerdictDocument = {
      caseId,
      timestamp: new Date(),
      title: result.title,
      summary: result.summary,
      persons: {
        person1: formData.person1,
        person2: formData.person2
      },
      result,
      votes: {
        likes: 0,
        dislikes: 0,
        voters: []
      }
    };

    const insertResult = await collection.insertOne(verdictDoc);
    console.log('Verdict saved with ID:', insertResult.insertedId);
    return insertResult.insertedId.toString();
  } catch (error) {
    console.error('Failed to save verdict:', error);
    throw error;
  }
}

// 获取历史判决列表
export async function getHistoryVerdicts(page: number = 1, limit: number = 10, searchTerm: string = '') {
  try {
    const database = await connectToDatabase();
    const collection: Collection<VerdictDocument> = database.collection('verdicts');

    const skip = (page - 1) * limit;

    // 构建搜索查询
    let query = {};

    if (searchTerm.trim()) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      query = {
        $or: [
          { title: searchRegex },
          { summary: searchRegex },
          { 'persons.person1.name': searchRegex },
          { 'persons.person2.name': searchRegex },
          { 'persons.person1.story': searchRegex },
          { 'persons.person2.story': searchRegex },
          { 'persons.person1.complaint': searchRegex },
          { 'persons.person2.complaint': searchRegex }
        ]
      };
    }

    const verdicts = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(query);

    return {
      verdicts: verdicts.map(v => ({
        ...v,
        _id: v._id?.toString()
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Failed to get history verdicts:', error);
    throw error;
  }
}

// 投票功能
export async function voteVerdict(verdictId: string, voteType: 'like' | 'dislike', deviceFingerprint: string) {
  try {
    const database = await connectToDatabase();
    const verdictsCollection: Collection<VerdictDocument> = database.collection('verdicts');
    const votesCollection: Collection<VoteDocument> = database.collection('votes');

    // 检查是否已经投票过
    const existingVote = await votesCollection.findOne({
      verdictId,
      deviceFingerprint
    });

    if (existingVote) {
      throw new Error('您已经对此判决投过票了');
    }

    // 开始事务
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // 记录投票
        await votesCollection.insertOne({
          verdictId,
          deviceFingerprint,
          voteType,
          timestamp: new Date()
        }, { session });

        // 更新判决的投票数
        const updateField = voteType === 'like' ? 'votes.likes' : 'votes.dislikes';
        await verdictsCollection.updateOne(
          { _id: new ObjectId(verdictId) },
          {
            $inc: { [updateField]: 1 },
            $push: { 'votes.voters': deviceFingerprint }
          },
          { session }
        );
      });

      console.log(`Vote recorded: ${voteType} for verdict ${verdictId}`);
      return true;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Failed to vote:', error);
    throw error;
  }
}

// 撤回投票功能
export async function withdrawVote(verdictId: string, deviceFingerprint: string) {
  try {
    const database = await connectToDatabase();
    const verdictsCollection: Collection<VerdictDocument> = database.collection('verdicts');
    const votesCollection: Collection<VoteDocument> = database.collection('votes');

    // 查找现有投票
    const existingVote = await votesCollection.findOne({
      verdictId,
      deviceFingerprint
    });

    if (!existingVote) {
      throw new Error('您还没有投票，无法撤回');
    }

    // 开始事务
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // 删除投票记录
        await votesCollection.deleteOne({
          verdictId,
          deviceFingerprint
        }, { session });

        // 更新判决的投票数
        const updateField = existingVote.voteType === 'like' ? 'votes.likes' : 'votes.dislikes';
        await verdictsCollection.updateOne(
          { _id: new ObjectId(verdictId) },
          {
            $inc: { [updateField]: -1 },
            $pull: { 'votes.voters': deviceFingerprint }
          },
          { session }
        );
      });

      console.log(`Vote withdrawn: ${existingVote.voteType} for verdict ${verdictId}`);
      return true;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Failed to withdraw vote:', error);
    throw error;
  }
}
export async function checkUserVoted(verdictId: string, deviceFingerprint: string): Promise<string | null> {
  try {
    const database = await connectToDatabase();
    const votesCollection: Collection<VoteDocument> = database.collection('votes');

    const vote = await votesCollection.findOne({
      verdictId,
      deviceFingerprint
    });

    return vote ? vote.voteType : null;
  } catch (error) {
    console.error('Failed to check vote status:', error);
    return null;
  }
}

// 获取单个判决详情
export async function getVerdictById(verdictId: string) {
  try {
    const database = await connectToDatabase();
    const collection: Collection<VerdictDocument> = database.collection('verdicts');

    const verdict = await collection.findOne({ _id: new ObjectId(verdictId) });
    if (!verdict) {
      throw new Error('判决不存在');
    }

    return {
      ...verdict,
      _id: verdict._id?.toString()
    };
  } catch (error) {
    console.error('Failed to get verdict by ID:', error);
    throw error;
  }
}

// 陪审团评论接口
interface JuryCommentDocument {
  _id?: ObjectId;
  verdictId: string;
  deviceFingerprint: string;
  comment: string;
  supportSide: 'person1' | 'person2' | 'neutral'; // 支持的一方
  timestamp: Date;
  likes: number;
  dislikes: number;
  voters: string[]; // 对该评论点赞/踩的用户设备指纹
}

// 陪审团投票接口
interface JuryVoteDocument {
  _id?: ObjectId;
  verdictId: string;
  deviceFingerprint: string;
  supportSide: 'person1' | 'person2'; // 支持的一方
  reasoning?: string; // 投票理由（可选）
  timestamp: Date;
}

// 陪审团统计信息
interface JuryStatsDocument {
  verdictId: string;
  totalVotes: number;
  person1Votes: number;
  person2Votes: number;
  totalComments: number;
  lastUpdated: Date;
}

// 陪审团投票功能
export async function submitJuryVote(
  verdictId: string,
  deviceFingerprint: string,
  supportSide: 'person1' | 'person2',
  reasoning?: string
) {
  try {
    const database = await connectToDatabase();
    const juryVotesCollection: Collection<JuryVoteDocument> = database.collection('jury_votes');

    // 检查是否已经投票过
    const existingVote = await juryVotesCollection.findOne({
      verdictId,
      deviceFingerprint
    });

    if (existingVote) {
      throw new Error('您已经对此案件投过票了');
    }

    // 插入投票记录
    await juryVotesCollection.insertOne({
      verdictId,
      deviceFingerprint,
      supportSide,
      reasoning,
      timestamp: new Date()
    });

    // 更新统计信息
    await updateJuryStats(verdictId);

    console.log(`Jury vote recorded: ${supportSide} for verdict ${verdictId}`);
    return true;
  } catch (error) {
    console.error('Failed to submit jury vote:', error);
    throw error;
  }
}

// 获取陪审团投票统计
export async function getJuryStats(verdictId: string) {
  try {
    const database = await connectToDatabase();
    const juryVotesCollection: Collection<JuryVoteDocument> = database.collection('jury_votes');

    const votes = await juryVotesCollection.find({ verdictId }).toArray();

    const person1Votes = votes.filter(v => v.supportSide === 'person1').length;
    const person2Votes = votes.filter(v => v.supportSide === 'person2').length;
    const totalVotes = person1Votes + person2Votes;

    return {
      totalVotes,
      person1Votes,
      person2Votes,
      person1Percentage: totalVotes > 0 ? Math.round((person1Votes / totalVotes) * 100) : 0,
      person2Percentage: totalVotes > 0 ? Math.round((person2Votes / totalVotes) * 100) : 0
    };
  } catch (error) {
    console.error('Failed to get jury stats:', error);
    throw error;
  }
}

// 更新陪审团统计信息（内部方法）
async function updateJuryStats(verdictId: string) {
  const stats = await getJuryStats(verdictId);
  const database = await connectToDatabase();
  const statsCollection: Collection<JuryStatsDocument> = database.collection('jury_stats');

  await statsCollection.updateOne(
    { verdictId },
    {
      $set: {
        ...stats,
        lastUpdated: new Date()
      }
    },
    { upsert: true }
  );
}

// 检查用户是否已经对陪审团投过票
export async function checkJuryVoted(verdictId: string, deviceFingerprint: string) {
  try {
    const database = await connectToDatabase();
    const juryVotesCollection: Collection<JuryVoteDocument> = database.collection('jury_votes');

    const vote = await juryVotesCollection.findOne({
      verdictId,
      deviceFingerprint
    });

    return vote ? vote.supportSide : null;
  } catch (error) {
    console.error('Failed to check jury vote status:', error);
    return null;
  }
}

// 提交陪审团评论
export async function submitJuryComment(
  verdictId: string,
  deviceFingerprint: string,
  comment: string,
  supportSide: 'person1' | 'person2' | 'neutral'
) {
  try {
    const database = await connectToDatabase();
    const commentsCollection: Collection<JuryCommentDocument> = database.collection('jury_comments');

    const commentDoc: JuryCommentDocument = {
      verdictId,
      deviceFingerprint,
      comment,
      supportSide,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      voters: []
    };

    const result = await commentsCollection.insertOne(commentDoc);
    console.log('Comment submitted:', result.insertedId);

    return {
      ...commentDoc,
      _id: result.insertedId.toString()
    };
  } catch (error) {
    console.error('Failed to submit comment:', error);
    throw error;
  }
}

// 获取陪审团评论列表
export async function getJuryComments(verdictId: string, page: number = 1, limit: number = 20) {
  try {
    const database = await connectToDatabase();
    const commentsCollection: Collection<JuryCommentDocument> = database.collection('jury_comments');

    const skip = (page - 1) * limit;
    const comments = await commentsCollection
      .find({ verdictId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await commentsCollection.countDocuments({ verdictId });

    return {
      comments: comments.map(c => ({
        ...c,
        _id: c._id?.toString()
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Failed to get jury comments:', error);
    throw error;
  }
}

// 获取用户还未投票的随机案例
export async function getRandomVerdictForUser(deviceFingerprint: string) {
  try {
    const database = await connectToDatabase();
    const verdictsCollection: Collection<VerdictDocument> = database.collection('verdicts');
    const juryVotesCollection: Collection<JuryVoteDocument> = database.collection('jury_votes');

    // 获取用户已投票的案例ID
    const userVotes = await juryVotesCollection.find({
      deviceFingerprint
    }).toArray();

    const votedVerdictIds = userVotes.map(vote => vote.verdictId);

    // 构建查询条件：排除用户已投票的案例
    const query = votedVerdictIds.length > 0
      ? { _id: { $nin: votedVerdictIds.map(id => new ObjectId(id)) } }
      : {};

    // 获取所有未投票的案例
    const availableVerdicts = await verdictsCollection.find(query).toArray();

    if (availableVerdicts.length === 0) {
      return null; // 没有可用案例
    }

    // 随机选择一个案例
    const randomIndex = Math.floor(Math.random() * availableVerdicts.length);
    const selectedVerdict = availableVerdicts[randomIndex];

    // 获取该案例的陪审团统计数据
    let juryStats = null;
    try {
      const juryStatsResponse = await getJuryStats(selectedVerdict._id?.toString() || '');
      if (juryStatsResponse.totalVotes > 0) {
        juryStats = juryStatsResponse;
      }
    } catch (error) {
      console.error('Failed to fetch jury stats:', error);
    }

    return {
      verdict: {
        ...selectedVerdict,
        _id: selectedVerdict._id?.toString(),
        juryStats
      }
    };
  } catch (error) {
    console.error('Failed to get random verdict for user:', error);
    throw error;
  }
}

export type { VerdictDocument, VoteDocument, JuryCommentDocument, JuryVoteDocument, JuryStatsDocument };