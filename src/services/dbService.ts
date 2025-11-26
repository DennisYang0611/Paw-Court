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
  if (!client) {
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
export async function getHistoryVerdicts(page: number = 1, limit: number = 10) {
  try {
    const database = await connectToDatabase();
    const collection: Collection<VerdictDocument> = database.collection('verdicts');

    const skip = (page - 1) * limit;
    const verdicts = await collection
      .find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments();

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

// 检查用户是否已投票
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

export type { VerdictDocument, VoteDocument };