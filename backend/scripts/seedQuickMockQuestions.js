require('dotenv').config();

const mongoose = require('mongoose');
const QuickPracticeQuestion = require('../models/QuickPracticeQuestion');

const questions = [
  // DSA
  {
    category: 'dsa',
    difficulty: 'easy',
    prompt: 'Which data structure is best suited for implementing a FIFO queue with O(1) enqueue and dequeue?',
    options: ['Array (push/shift)', 'Singly linked list with head+tail pointers', 'Binary search tree', 'Heap'],
    correctIndex: 1,
    explanation: 'With head and tail pointers, both enqueue (tail) and dequeue (head) are O(1).',
    tags: ['queue', 'linked-list']
  },
  {
    category: 'dsa',
    difficulty: 'easy',
    prompt: 'What is the average time complexity of lookup in a well-implemented hash map?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 0,
    explanation: 'With good hashing and resizing, average lookup is constant time.',
    tags: ['hashmap', 'complexity']
  },
  {
    category: 'dsa',
    difficulty: 'medium',
    prompt: 'Which traversal visits nodes level by level in a tree or graph?',
    options: ['DFS', 'BFS', 'In-order', 'Post-order'],
    correctIndex: 1,
    explanation: 'Breadth-first search explores nodes by increasing distance (levels).',
    tags: ['bfs', 'graph']
  },
  {
    category: 'dsa',
    difficulty: 'medium',
    prompt: 'Which data structure is commonly used to get the k smallest elements efficiently from a stream?',
    options: ['Min-heap of all elements', 'Max-heap of size k', 'Queue', 'Stack'],
    correctIndex: 1,
    explanation: 'Maintain a max-heap of size k; eject larger elements so the heap holds the k smallest seen so far.',
    tags: ['heap', 'stream']
  },
  {
    category: 'dsa',
    difficulty: 'medium',
    prompt: 'In a sorted array, which technique is typically used to find a pair with a given sum in O(n)?',
    options: ['Two pointers', 'Backtracking', 'Heap sort', 'Union-Find'],
    correctIndex: 0,
    explanation: 'Two pointers move inward based on the current sum and runs in linear time.',
    tags: ['two-pointers', 'array']
  },
  {
    category: 'dsa',
    difficulty: 'hard',
    prompt: 'Which statement about quicksort is correct?',
    options: ['Worst-case time is always O(n log n)', 'Average time is O(n log n)', 'It is stable by default', 'It uses O(n) extra space'],
    correctIndex: 1,
    explanation: 'Quicksort average is O(n log n), but worst-case can degrade to O(n^2) with poor pivots.',
    tags: ['sorting', 'quicksort']
  },
  {
    category: 'dsa',
    difficulty: 'medium',
    prompt: 'Which graph algorithm is used to find shortest paths in an unweighted graph?',
    options: ['Dijkstra', 'BFS', 'Bellman-Ford', 'Floyd-Warshall'],
    correctIndex: 1,
    explanation: 'In an unweighted graph, BFS gives shortest path in terms of edge count.',
    tags: ['graph', 'shortest-path']
  },
  {
    category: 'dsa',
    difficulty: 'easy',
    prompt: 'Which data structure is typically used to implement recursion internally?',
    options: ['Queue', 'Stack', 'Heap', 'Hash table'],
    correctIndex: 1,
    explanation: 'Function calls are stored in a call stack.',
    tags: ['stack', 'recursion']
  },

  // OOP
  {
    category: 'oop',
    difficulty: 'easy',
    prompt: 'Encapsulation primarily helps by:',
    options: ['Making all fields public', 'Hiding internal state and exposing a controlled interface', 'Avoiding the need for objects', 'Guaranteeing faster runtime'],
    correctIndex: 1,
    explanation: 'Encapsulation restricts direct access to internal data and enforces invariants via methods.',
    tags: ['encapsulation']
  },
  {
    category: 'oop',
    difficulty: 'easy',
    prompt: 'Polymorphism allows you to:',
    options: ['Store different types behind a common interface', 'Prevent inheritance', 'Avoid using classes', 'Only use static methods'],
    correctIndex: 0,
    explanation: 'With polymorphism, code can work with an interface/base type while using different implementations.',
    tags: ['polymorphism', 'interfaces']
  },
  {
    category: 'oop',
    difficulty: 'medium',
    prompt: 'Which SOLID principle suggests that a class should have only one reason to change?',
    options: ['Open/Closed', 'Single Responsibility', 'Liskov Substitution', 'Interface Segregation'],
    correctIndex: 1,
    explanation: 'Single Responsibility Principle focuses on one responsibility per class/module.',
    tags: ['solid', 'srp']
  },
  {
    category: 'oop',
    difficulty: 'medium',
    prompt: 'Which is generally preferred for code reuse when “is-a” is not a natural fit?',
    options: ['Inheritance', 'Composition', 'Global variables', 'Copy-paste'],
    correctIndex: 1,
    explanation: 'Composition reduces tight coupling and avoids fragile base class problems.',
    tags: ['composition', 'design']
  },
  {
    category: 'oop',
    difficulty: 'medium',
    prompt: 'What does the Liskov Substitution Principle imply?',
    options: ['Subclasses can change method contracts freely', 'A subtype should be substitutable for its base type without breaking correctness', 'Interfaces should be large', 'Classes should not have constructors'],
    correctIndex: 1,
    explanation: 'LSP requires behavioral compatibility so base-type consumers continue to work.',
    tags: ['solid', 'lsp']
  },
  {
    category: 'oop',
    difficulty: 'medium',
    prompt: 'A common benefit of an interface (vs a concrete class) is:',
    options: ['It guarantees memory savings', 'It enables dependency inversion and easier testing', 'It prevents polymorphism', 'It removes the need for error handling'],
    correctIndex: 1,
    explanation: 'Depending on abstractions makes it easier to swap implementations (e.g., mocks in tests).',
    tags: ['interfaces', 'testing']
  },
  {
    category: 'oop',
    difficulty: 'hard',
    prompt: 'Which is a typical sign of a “God Object”?',
    options: ['A class that is immutable', 'A class that owns too many responsibilities and knows too much', 'A class that uses interfaces', 'A class with a small public API'],
    correctIndex: 1,
    explanation: 'God Objects centralize logic and become hard to maintain and test.',
    tags: ['code-smell', 'design']
  },
  {
    category: 'oop',
    difficulty: 'easy',
    prompt: 'Abstraction is best described as:',
    options: ['Hiding complexity by exposing only essential features', 'Using only abstract classes', 'Removing all data members', 'Avoiding functions'],
    correctIndex: 0,
    explanation: 'Abstraction focuses on what an object does, not how it does it.',
    tags: ['abstraction']
  },

  // DBMS
  {
    category: 'dbms',
    difficulty: 'easy',
    prompt: 'Which property of ACID ensures that a transaction’s effects are all applied or none are applied?',
    options: ['Consistency', 'Isolation', 'Atomicity', 'Durability'],
    correctIndex: 2,
    explanation: 'Atomicity means the transaction is an all-or-nothing unit.',
    tags: ['acid', 'transactions']
  },
  {
    category: 'dbms',
    difficulty: 'easy',
    prompt: 'What is the main purpose of an index in a database?',
    options: ['To reduce storage size', 'To speed up read queries by improving lookup', 'To automatically encrypt columns', 'To guarantee no duplicates'],
    correctIndex: 1,
    explanation: 'Indexes trade extra storage/write cost for faster reads.',
    tags: ['index', 'performance']
  },
  {
    category: 'dbms',
    difficulty: 'medium',
    prompt: 'Which normal form eliminates partial dependency on a composite key?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correctIndex: 1,
    explanation: '2NF removes partial dependencies by ensuring non-key attributes depend on the whole key.',
    tags: ['normalization', '2nf']
  },
  {
    category: 'dbms',
    difficulty: 'medium',
    prompt: 'In SQL, which JOIN returns all rows from the left table and matching rows from the right table?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
    correctIndex: 1,
    explanation: 'LEFT JOIN preserves all left-side rows; unmatched right columns become NULL.',
    tags: ['sql', 'join']
  },
  {
    category: 'dbms',
    difficulty: 'medium',
    prompt: 'Which isolation problem is prevented by SERIALIZABLE isolation level?',
    options: ['Dirty reads only', 'Non-repeatable reads only', 'Phantom reads', 'None; it allows all anomalies'],
    correctIndex: 2,
    explanation: 'Serializable is the strictest and prevents phantom reads (and other common anomalies).',
    tags: ['isolation', 'transactions']
  },
  {
    category: 'dbms',
    difficulty: 'medium',
    prompt: 'Which constraint ensures a column value must reference an existing row in another table?',
    options: ['PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK'],
    correctIndex: 1,
    explanation: 'A foreign key enforces referential integrity.',
    tags: ['constraints', 'foreign-key']
  },
  {
    category: 'dbms',
    difficulty: 'hard',
    prompt: 'What is a common downside of adding too many indexes to a write-heavy table?',
    options: ['Reads become slower', 'Writes become slower due to index maintenance', 'The table becomes immutable', 'It disables transactions'],
    correctIndex: 1,
    explanation: 'Each insert/update/delete must update indexes, increasing write latency.',
    tags: ['index', 'tradeoffs']
  },
  {
    category: 'dbms',
    difficulty: 'easy',
    prompt: 'Which command is typically used to ensure changes are permanently saved in a transaction?',
    options: ['ROLLBACK', 'COMMIT', 'EXPLAIN', 'DESCRIBE'],
    correctIndex: 1,
    explanation: 'COMMIT finalizes the transaction; ROLLBACK discards changes.',
    tags: ['sql', 'transactions']
  },

  // OS
  {
    category: 'os',
    difficulty: 'easy',
    prompt: 'A process differs from a thread mainly because a process:',
    options: ['Cannot be scheduled by the OS', 'Has its own address space', 'Always runs faster', 'Cannot perform I/O'],
    correctIndex: 1,
    explanation: 'Processes have separate address spaces; threads share a process address space.',
    tags: ['process', 'thread']
  },
  {
    category: 'os',
    difficulty: 'medium',
    prompt: 'Which is NOT one of the necessary conditions for deadlock (Coffman conditions)?',
    options: ['Mutual exclusion', 'Hold and wait', 'Preemption allowed', 'Circular wait'],
    correctIndex: 2,
    explanation: 'Deadlock requires no preemption; allowing preemption can help prevent deadlocks.',
    tags: ['deadlock']
  },
  {
    category: 'os',
    difficulty: 'medium',
    prompt: 'What is the main goal of virtual memory?',
    options: ['Increase CPU clock speed', 'Allow processes to use more memory than physically available (via paging)', 'Eliminate the need for disk', 'Disable caching'],
    correctIndex: 1,
    explanation: 'Virtual memory provides the illusion of a large memory space by paging to disk.',
    tags: ['virtual-memory', 'paging']
  },
  {
    category: 'os',
    difficulty: 'easy',
    prompt: 'A context switch typically involves:',
    options: ['Replacing the hard drive', 'Saving and restoring CPU state between tasks', 'Encrypting RAM', 'Resetting the kernel'],
    correctIndex: 1,
    explanation: 'The OS saves registers/program counter for one task and restores another’s state.',
    tags: ['scheduling', 'context-switch']
  },
  {
    category: 'os',
    difficulty: 'medium',
    prompt: 'Which synchronization primitive is best suited to protect a short critical section in a single process?',
    options: ['Mutex', 'Busy waiting without atomic ops', 'File lock', 'Paging'],
    correctIndex: 0,
    explanation: 'Mutexes are commonly used to protect shared memory critical sections.',
    tags: ['mutex', 'concurrency']
  },
  {
    category: 'os',
    difficulty: 'hard',
    prompt: 'What is a typical symptom of thrashing?',
    options: ['High CPU utilization and low disk I/O', 'High page fault rate and heavy disk activity', 'No context switching', 'Stable low memory usage'],
    correctIndex: 1,
    explanation: 'Thrashing happens when the system spends most time swapping pages in/out.',
    tags: ['memory', 'thrashing']
  },
  {
    category: 'os',
    difficulty: 'medium',
    prompt: 'In paging, what is a page table used for?',
    options: ['Mapping virtual pages to physical frames', 'Compressing memory', 'Scheduling processes', 'Encrypting disk blocks'],
    correctIndex: 0,
    explanation: 'The page table translates virtual addresses to physical addresses via frames.',
    tags: ['paging', 'memory']
  },
  {
    category: 'os',
    difficulty: 'easy',
    prompt: 'Which scheduling algorithm is typically used to provide fairness by giving each process a time slice?',
    options: ['FCFS', 'SJF', 'Round Robin', 'Priority only'],
    correctIndex: 2,
    explanation: 'Round Robin cycles through runnable tasks with a fixed time quantum.',
    tags: ['scheduling', 'round-robin']
  },

  // Networks
  {
    category: 'networks',
    difficulty: 'easy',
    prompt: 'Which protocol is connection-oriented?',
    options: ['UDP', 'TCP', 'ICMP', 'ARP'],
    correctIndex: 1,
    explanation: 'TCP establishes a connection and provides reliable delivery.',
    tags: ['tcp', 'udp']
  },
  {
    category: 'networks',
    difficulty: 'easy',
    prompt: 'DNS is primarily used to:',
    options: ['Encrypt HTTP traffic', 'Translate domain names to IP addresses', 'Route packets between routers', 'Allocate RAM'],
    correctIndex: 1,
    explanation: 'DNS resolves human-readable domain names into IP addresses.',
    tags: ['dns']
  },
  {
    category: 'networks',
    difficulty: 'medium',
    prompt: 'Which HTTP status code indicates “Too Many Requests”?',
    options: ['401', '403', '404', '429'],
    correctIndex: 3,
    explanation: '429 is returned when the client exceeds rate limits.',
    tags: ['http', 'status-codes']
  },
  {
    category: 'networks',
    difficulty: 'medium',
    prompt: 'TLS primarily provides:',
    options: ['Only compression', 'Confidentiality and integrity for data in transit', 'Faster DNS', 'Better caching'],
    correctIndex: 1,
    explanation: 'TLS encrypts traffic and includes integrity checks to prevent tampering.',
    tags: ['tls', 'security']
  },
  {
    category: 'networks',
    difficulty: 'medium',
    prompt: 'In the OSI model, routing typically happens at which layer?',
    options: ['Data Link (Layer 2)', 'Network (Layer 3)', 'Transport (Layer 4)', 'Application (Layer 7)'],
    correctIndex: 1,
    explanation: 'IP routing is a Layer 3 (Network layer) responsibility.',
    tags: ['osi', 'routing']
  },
  {
    category: 'networks',
    difficulty: 'hard',
    prompt: 'What is a key purpose of TCP congestion control?',
    options: ['Guarantee zero latency', 'Prevent overwhelming the network by adjusting sending rate', 'Encrypt packets automatically', 'Avoid the need for acknowledgements'],
    correctIndex: 1,
    explanation: 'Congestion control adapts the sending rate based on network signals (loss/delay).',
    tags: ['tcp', 'congestion-control']
  },
  {
    category: 'networks',
    difficulty: 'easy',
    prompt: 'Which of the following is true about UDP?',
    options: ['It guarantees delivery and ordering', 'It is connectionless and does not guarantee delivery', 'It performs a three-way handshake', 'It always retransmits lost packets'],
    correctIndex: 1,
    explanation: 'UDP is connectionless; reliability is typically handled by the application if needed.',
    tags: ['udp']
  },
  {
    category: 'networks',
    difficulty: 'medium',
    prompt: 'What does “idempotent” mean for an HTTP method?',
    options: ['It is always cached', 'Multiple identical requests have the same effect as one', 'It always returns JSON', 'It always uses TLS'],
    correctIndex: 1,
    explanation: 'Idempotent methods can be repeated without additional side effects (e.g., PUT, DELETE).',
    tags: ['http', 'idempotent']
  },

  // System Design
  {
    category: 'system-design',
    difficulty: 'easy',
    prompt: 'A load balancer is primarily used to:',
    options: ['Store files', 'Distribute traffic across multiple servers', 'Compile code', 'Replace databases'],
    correctIndex: 1,
    explanation: 'Load balancers spread requests to improve availability and throughput.',
    tags: ['load-balancing']
  },
  {
    category: 'system-design',
    difficulty: 'medium',
    prompt: 'Which caching strategy reduces load on the database by reading from cache first and filling on miss?',
    options: ['Write-through', 'Cache-aside (lazy loading)', 'Write-behind only', 'No-cache'],
    correctIndex: 1,
    explanation: 'Cache-aside reads from cache and fetches from DB only on cache miss.',
    tags: ['caching']
  },
  {
    category: 'system-design',
    difficulty: 'medium',
    prompt: 'A message queue is commonly used to:',
    options: ['Make all requests synchronous', 'Decouple services and smooth traffic spikes', 'Replace authentication', 'Store images'],
    correctIndex: 1,
    explanation: 'Queues allow async processing and buffering during bursts.',
    tags: ['queue', 'async']
  },
  {
    category: 'system-design',
    difficulty: 'medium',
    prompt: 'Which approach is commonly used to generate globally unique sortable IDs in distributed systems?',
    options: ['Auto-increment integer in a single DB', 'Snowflake-style IDs (time + worker + sequence)', 'Random 4-digit numbers', 'Using user email as ID'],
    correctIndex: 1,
    explanation: 'Snowflake-like IDs are unique, roughly time-ordered, and don’t require a single DB lock.',
    tags: ['ids', 'distributed']
  },
  {
    category: 'system-design',
    difficulty: 'hard',
    prompt: 'What is a common downside of “strong consistency everywhere” in a global system?',
    options: ['Lower latency always', 'Higher availability always', 'Increased latency and reduced availability during partitions', 'It eliminates conflicts automatically'],
    correctIndex: 2,
    explanation: 'Strong consistency often requires coordination across regions, increasing latency and impacting availability under partitions.',
    tags: ['consistency', 'cap']
  },
  {
    category: 'system-design',
    difficulty: 'medium',
    prompt: 'Sharding primarily helps with:',
    options: ['Reducing the need for backups', 'Scaling a database by partitioning data across machines', 'Eliminating indexes', 'Turning SQL into NoSQL'],
    correctIndex: 1,
    explanation: 'Sharding distributes data and load so a single machine is not the bottleneck.',
    tags: ['sharding', 'scaling']
  },
  {
    category: 'system-design',
    difficulty: 'medium',
    prompt: 'Rate limiting is primarily used to:',
    options: ['Speed up every request', 'Protect systems from abuse and sudden spikes', 'Replace logging', 'Increase CPU usage'],
    correctIndex: 1,
    explanation: 'Rate limiting prevents overload and abuse by restricting request rates.',
    tags: ['rate-limiting', 'reliability']
  },
  {
    category: 'system-design',
    difficulty: 'easy',
    prompt: 'Which is a typical use case for a CDN?',
    options: ['Serving static assets closer to users', 'Running background jobs', 'Storing primary relational data', 'Handling authentication tokens'],
    correctIndex: 0,
    explanation: 'CDNs cache and serve static content at edge locations to reduce latency.',
    tags: ['cdn', 'performance']
  },

  // Behavioral
  {
    category: 'behavioral',
    difficulty: 'easy',
    prompt: 'When answering behavioral questions, the STAR method stands for:',
    options: ['Scope, Timeline, Action, Result', 'Situation, Task, Action, Result', 'Skill, Tool, Achievement, Review', 'Strategy, Tactics, Analysis, Retrospective'],
    correctIndex: 1,
    explanation: 'STAR is a structured way to explain a real example with context and outcome.',
    tags: ['communication', 'star']
  },
  {
    category: 'behavioral',
    difficulty: 'medium',
    prompt: 'A good way to handle conflicting priorities is to:',
    options: ['Do everything at once', 'Hide the conflict and hope it resolves', 'Clarify impact, align with stakeholders, and sequence work', 'Ignore deadlines'],
    correctIndex: 2,
    explanation: 'You should communicate tradeoffs, ask for prioritization, and plan based on impact.',
    tags: ['prioritization', 'communication']
  },
  {
    category: 'behavioral',
    difficulty: 'medium',
    prompt: 'If you disagree with a teammate’s approach, the most professional first step is to:',
    options: ['Publicly criticize it in a group chat', 'Escalate immediately to a manager', 'Ask questions and share concerns with evidence in a 1:1 or small discussion', 'Refuse to work on it'],
    correctIndex: 2,
    explanation: 'Start with respectful discussion and facts; escalate only if needed.',
    tags: ['collaboration', 'conflict']
  },
  {
    category: 'behavioral',
    difficulty: 'medium',
    prompt: 'A strong response to “Tell me about a failure” should include:',
    options: ['Only blame external factors', 'What you learned and what you changed afterward', 'No details to avoid risk', 'A perfect story with no mistakes'],
    correctIndex: 1,
    explanation: 'Hiring teams value reflection, learning, and improved behavior/process.',
    tags: ['growth-mindset']
  },
  {
    category: 'behavioral',
    difficulty: 'medium',
    prompt: 'When you receive critical feedback, a good immediate response is to:',
    options: ['Argue back immediately', 'Listen, clarify, and propose next steps', 'Ignore it', 'Complain to others'],
    correctIndex: 1,
    explanation: 'Clarifying and acting on feedback shows maturity and professionalism.',
    tags: ['feedback', 'communication']
  },
  {
    category: 'behavioral',
    difficulty: 'hard',
    prompt: 'If requirements are ambiguous, the best approach is to:',
    options: ['Guess and build silently', 'Stop work indefinitely', 'Ask clarifying questions, propose assumptions, and validate early', 'Only follow old documentation'],
    correctIndex: 2,
    explanation: 'Explicit assumptions + early validation reduce rework and build trust.',
    tags: ['ambiguity', 'product-thinking']
  },
  {
    category: 'behavioral',
    difficulty: 'easy',
    prompt: 'In a team setting, “ownership” most closely means:',
    options: ['Doing everything yourself', 'Taking responsibility for outcomes and follow-through', 'Avoiding communication', 'Only working on what is assigned'],
    correctIndex: 1,
    explanation: 'Ownership means seeing a task through, communicating risks, and ensuring completion.',
    tags: ['ownership']
  },
  {
    category: 'behavioral',
    difficulty: 'medium',
    prompt: 'A good way to motivate yourself during a long preparation plan is to:',
    options: ['Only do mock tests on the last day', 'Set small measurable goals and track progress weekly', 'Avoid reviewing mistakes', 'Change resources daily'],
    correctIndex: 1,
    explanation: 'Small goals and feedback loops keep momentum and make progress visible.',
    tags: ['motivation', 'habits']
  }
];

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepiq';
  await mongoose.connect(mongoUri);

  const ops = questions.map((q) => ({
    updateOne: {
      filter: { category: q.category, prompt: q.prompt },
      update: { $setOnInsert: q },
      upsert: true
    }
  }));

  const result = await QuickPracticeQuestion.bulkWrite(ops, { ordered: false });

  const inserted = result.upsertedCount || 0;
  const matched = result.matchedCount || 0;

  console.log(`✅ Quick Mock seed complete: inserted ${inserted}, already-existed ${matched}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
