require('dotenv').config();
const mongoose = require('mongoose');
const Interview = require('../models/Interview');

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    dryRun: args.has('--dry-run') || args.has('--dryrun'),
    limit: (() => {
      const withLimit = argv.find((a) => a.startsWith('--limit='));
      if (!withLimit) return null;
      const n = Number(withLimit.split('=')[1]);
      return Number.isFinite(n) && n > 0 ? n : null;
    })()
  };
}

function pickFallbackType(interview) {
  const types = Array.isArray(interview?.configuration?.questionTypes)
    ? interview.configuration.questionTypes
    : [];
  const fallback = String(types[0] || 'behavioral').toLowerCase();
  return ['behavioral', 'technical', 'system-design', 'coding'].includes(fallback) ? fallback : 'behavioral';
}

async function main() {
  const { dryRun, limit } = parseArgs(process.argv);

  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  // Only fix non-coding interviews. Coding interviews are expected to have coding questions.
  const query = {
    type: { $ne: 'coding' },
    questions: {
      $elemMatch: {
        type: 'coding',
        $or: [
          { testCases: { $exists: false } },
          { testCases: { $size: 0 } }
        ]
      }
    }
  };

  const cursor = Interview.find(query).cursor();

  let scanned = 0;
  let updatedInterviews = 0;
  let updatedQuestions = 0;

  for await (const interview of cursor) {
    scanned += 1;

    const fallbackType = pickFallbackType(interview);
    let changed = false;

    const questions = Array.isArray(interview.questions) ? interview.questions : [];
    for (const q of questions) {
      const hasTests = Array.isArray(q.testCases) && q.testCases.length > 0;
      if (q.type === 'coding' && !hasTests) {
        q.type = fallbackType === 'coding' ? 'behavioral' : fallbackType;
        changed = true;
        updatedQuestions += 1;
      }
    }

    if (changed) {
      updatedInterviews += 1;
      if (!dryRun) {
        await interview.save();
      }
    }

    if (limit && scanned >= limit) break;
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        scanned,
        updatedInterviews,
        updatedQuestions
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Fix script failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
