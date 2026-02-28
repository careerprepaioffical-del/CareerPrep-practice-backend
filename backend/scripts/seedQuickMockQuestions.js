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
  },

  // HTML
  {
    category: 'html',
    difficulty: 'easy',
    prompt: 'Which HTML5 element is used to draw graphics via JavaScript?',
    options: ['<graphics>', '<canvas>', '<draw>', '<svg>'],
    correctIndex: 1,
    explanation: 'The <canvas> element is used in HTML5 to draw graphics, animations, and other visual images on the fly via JavaScript.',
    tags: ['html5', 'canvas', 'graphics']
  },
  {
    category: 'html',
    difficulty: 'easy',
    prompt: 'What is the purpose of the "alt" attribute in an <img> tag?',
    options: ['To specify the image source', 'To provide alternative text for screen readers', 'To set the image alignment', 'To define the image size'],
    correctIndex: 1,
    explanation: 'The "alt" attribute provides alternative text for an image, which is important for accessibility and displays when the image cannot be loaded.',
    tags: ['html', 'accessibility', 'img']
  },
  {
    category: 'html',
    difficulty: 'easy',
    prompt: 'Which semantic HTML5 element would be most appropriate for navigation links?',
    options: ['<navigation>', '<menu>', '<nav>', '<links>'],
    correctIndex: 2,
    explanation: 'The <nav> element is specifically designed to contain navigation links, providing semantic meaning to navigation sections.',
    tags: ['html5', 'semantic', 'navigation']
  },
  {
    category: 'html',
    difficulty: 'medium',
    prompt: 'What does the "defer" attribute do when used with a <script> tag?',
    options: ['Stops script execution', 'Loads script asynchronously', 'Executes script after HTML parsing', 'Caches the script'],
    correctIndex: 2,
    explanation: 'The "defer" attribute tells the browser to download the script but wait until the HTML document has been fully parsed before executing it.',
    tags: ['html', 'script', 'performance']
  },
  {
    category: 'html',
    difficulty: 'medium',
    prompt: 'Which attribute makes a form field required in HTML5?',
    options: ['mandatory', 'required', 'validate', 'must-fill'],
    correctIndex: 1,
    explanation: 'The "required" attribute prevents form submission if the field is empty.',
    tags: ['html5', 'forms', 'validation']
  },
  {
    category: 'html',
    difficulty: 'hard',
    prompt: 'What is the recommended way to include multiple alternate stylesheets that the user can select?',
    options: ['Use multiple <style> tags', 'Use <link rel="alternate stylesheet"> with different titles', 'Use inline styles only', 'Embed CSS in JavaScript'],
    correctIndex: 1,
    explanation: 'The "alternate stylesheet" link relation with different title attributes allows users to switch between style options.',
    tags: ['html', 'css', 'accessibility']
  },
  {
    category: 'html',
    difficulty: 'easy',
    prompt: 'Which HTML element is used to define a table header cell?',
    options: ['<thead>', '<th>', '<header>', '<td>'],
    correctIndex: 1,
    explanation: 'The <th> element defines a header cell in a table, typically displayed in bold and centered.',
    tags: ['html', 'tables']
  },
  {
    category: 'html',
    difficulty: 'medium',
    prompt: 'What is the purpose of the "data-*" attributes in HTML5?',
    options: ['To encrypt data', 'To store custom data private to the page or application', 'To validate forms', 'To define database schemas'],
    correctIndex: 1,
    explanation: 'data-* attributes allow you to store extra information on HTML elements that can be accessed via JavaScript.',
    tags: ['html5', 'data-attributes', 'javascript']
  },

  // CSS
  {
    category: 'css',
    difficulty: 'easy',
    prompt: 'Which CSS property is used to change the text color of an element?',
    options: ['text-color', 'font-color', 'color', 'text-style'],
    correctIndex: 2,
    explanation: 'The "color" property in CSS is used to set the text color of an element.',
    tags: ['css', 'text', 'color']
  },
  {
    category: 'css',
    difficulty: 'easy',
    prompt: 'Which CSS selector selects elements with a specific class?',
    options: ['#classname', '.classname', '*classname', 'classname'],
    correctIndex: 1,
    explanation: 'The class selector in CSS uses a dot (.) followed by the class name to select elements with that specific class.',
    tags: ['css', 'selectors']
  },
  {
    category: 'css',
    difficulty: 'medium',
    prompt: 'What is the CSS Flexbox property that controls the main axis alignment of items?',
    options: ['align-items', 'justify-content', 'flex-direction', 'align-content'],
    correctIndex: 1,
    explanation: 'justify-content aligns flex items along the main axis (horizontal by default).',
    tags: ['css', 'flexbox', 'layout']
  },
  {
    category: 'css',
    difficulty: 'medium',
    prompt: 'What does the CSS "box-sizing: border-box" property do?',
    options: ['Removes all borders', 'Includes padding and border in the element\'s total width and height', 'Only applies to <div> elements', 'Disables margin'],
    correctIndex: 1,
    explanation: 'border-box makes width/height include padding and border, making sizing calculations easier.',
    tags: ['css', 'box-model', 'sizing']
  },
  {
    category: 'css',
    difficulty: 'medium',
    prompt: 'Which CSS property is used to create a grid layout?',
    options: ['display: flex', 'display: grid', 'display: table', 'display: inline-block'],
    correctIndex: 1,
    explanation: 'display: grid enables CSS Grid Layout for creating complex two-dimensional layouts.',
    tags: ['css', 'grid', 'layout']
  },
  {
    category: 'css',
    difficulty: 'hard',
    prompt: 'What is CSS specificity used for when multiple rules target the same element?',
    options: ['To determine animation speed', 'To calculate which rule takes precedence', 'To set font size', 'To enable responsive design'],
    correctIndex: 1,
    explanation: 'Specificity determines which CSS rule is applied when multiple rules match. Higher specificity wins.',
    tags: ['css', 'specificity', 'cascade']
  },
  {
    category: 'css',
    difficulty: 'easy',
    prompt: 'Which CSS unit is relative to the font-size of the root element?',
    options: ['em', 'rem', 'px', '%'],
    correctIndex: 1,
    explanation: 'rem (root em) is relative to the root element\'s font-size, providing consistent sizing.',
    tags: ['css', 'units', 'rem']
  },
  {
    category: 'css',
    difficulty: 'medium',
    prompt: 'What does the CSS "position: sticky" property do?',
    options: ['Makes element unmovable forever', 'Toggles between relative and fixed based on scroll position', 'Removes element from document flow', 'Centers the element'],
    correctIndex: 1,
    explanation: 'position: sticky acts like relative positioning until a scroll threshold, then becomes fixed.',
    tags: ['css', 'positioning', 'sticky']
  },

  // JavaScript
  {
    category: 'javascript',
    difficulty: 'easy',
    prompt: 'Which keyword is used to declare a block-scoped variable in JavaScript?',
    options: ['var', 'let', 'const', 'define'],
    correctIndex: 1,
    explanation: '"let" declares a block-scoped variable that can be reassigned. "const" is also block-scoped but cannot be reassigned.',
    tags: ['javascript', 'variables', 'scope']
  },
  {
    category: 'javascript',
    difficulty: 'easy',
    prompt: 'What is the result of: typeof null?',
    options: ['"null"', '"object"', '"undefined"', '"number"'],
    correctIndex: 1,
    explanation: 'This is a well-known JavaScript quirk: typeof null returns "object" due to a legacy bug.',
    tags: ['javascript', 'typeof', 'quirks']
  },
  {
    category: 'javascript',
    difficulty: 'medium',
    prompt: 'What does the Array.map() method return?',
    options: ['The original array modified', 'A new array with transformed elements', 'A single value', 'undefined'],
    correctIndex: 1,
    explanation: 'Array.map() creates a new array with the results of calling a function on every element.',
    tags: ['javascript', 'arrays', 'map']
  },
  {
    category: 'javascript',
    difficulty: 'medium',
    prompt: 'What is a closure in JavaScript?',
    options: ['A syntax error', 'A function that has access to variables from its outer scope', 'A way to close files', 'A loop statement'],
    correctIndex: 1,
    explanation: 'A closure is created when a function accesses variables from its enclosing lexical scope.',
    tags: ['javascript', 'closures', 'scope']
  },
  {
    category: 'javascript',
    difficulty: 'medium',
    prompt: 'What is the purpose of the "async" keyword in JavaScript?',
    options: ['To run code faster', 'To declare a function that returns a Promise', 'To make synchronous code', 'To disable await'],
    correctIndex: 1,
    explanation: 'The async keyword makes a function return a Promise and allows the use of await inside it.',
    tags: ['javascript', 'async', 'promises']
  },
  {
    category: 'javascript',
    difficulty: 'hard',
    prompt: 'What is the event loop in JavaScript?',
    options: ['A type of loop structure', 'A mechanism that handles asynchronous callbacks by managing call stack and callback queue', 'A way to debug code', 'A CSS animation'],
    correctIndex: 1,
    explanation: 'The event loop processes callbacks from the queue when the call stack is empty, enabling non-blocking I/O.',
    tags: ['javascript', 'event-loop', 'async']
  },
  {
    category: 'javascript',
    difficulty: 'easy',
    prompt: 'Which method adds one or more elements to the end of an array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    correctIndex: 0,
    explanation: 'Array.push() adds elements to the end and returns the new length.',
    tags: ['javascript', 'arrays']
  },
  {
    category: 'javascript',
    difficulty: 'medium',
    prompt: 'What is the difference between "==" and "===" in JavaScript?',
    options: ['They are identical', '"==" performs type coercion, "===" does not', '"===" is slower', '"==" is deprecated'],
    correctIndex: 1,
    explanation: '"==" compares with type conversion while "===" checks both value and type without conversion.',
    tags: ['javascript', 'operators', 'comparison']
  },

  // React
  {
    category: 'react',
    difficulty: 'easy',
    prompt: 'What hook is used to manage state in a functional React component?',
    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
    correctIndex: 1,
    explanation: 'useState is the primary hook for adding state to functional components.',
    tags: ['react', 'hooks', 'state']
  },
  {
    category: 'react',
    difficulty: 'easy',
    prompt: 'What is JSX in React?',
    options: ['A database query language', 'A syntax extension that looks like HTML but is JavaScript', 'A CSS framework', 'A testing library'],
    correctIndex: 1,
    explanation: 'JSX allows you to write HTML-like syntax in JavaScript, which React transforms into function calls.',
    tags: ['react', 'jsx']
  },
  {
    category: 'react',
    difficulty: 'medium',
    prompt: 'When should you use the useEffect hook?',
    options: ['To declare state variables', 'To perform side effects like data fetching or subscriptions', 'To render JSX', 'To define props'],
    correctIndex: 1,
    explanation: 'useEffect runs after render and is used for side effects like API calls, subscriptions, or DOM manipulation.',
    tags: ['react', 'hooks', 'useEffect']
  },
  {
    category: 'react',
    difficulty: 'medium',
    prompt: 'What is the purpose of the "key" prop in React lists?',
    options: ['To encrypt data', 'To help React identify which items have changed, added, or removed', 'To set CSS styles', 'To pass data to components'],
    correctIndex: 1,
    explanation: 'Keys help React optimize rendering by tracking element identity across renders.',
    tags: ['react', 'lists', 'keys']
  },
  {
    category: 'react',
    difficulty: 'medium',
    prompt: 'What is prop drilling in React?',
    options: ['A performance optimization', 'Passing props through multiple levels of components', 'A testing technique', 'A state management library'],
    correctIndex: 1,
    explanation: 'Prop drilling occurs when you pass props through intermediate components that don\'t use them, just to reach deeper components.',
    tags: ['react', 'props', 'patterns']
  },
  {
    category: 'react',
    difficulty: 'hard',
    prompt: 'What is the purpose of React.memo()?',
    options: ['To store data in localStorage', 'To prevent unnecessary re-renders by memoizing component output', 'To create class components', 'To handle routing'],
    correctIndex: 1,
    explanation: 'React.memo() is a higher-order component that memoizes the result, re-rendering only when props change.',
    tags: ['react', 'performance', 'memoization']
  },
  {
    category: 'react',
    difficulty: 'easy',
    prompt: 'Which hook would you use to access context in a functional component?',
    options: ['useState', 'useEffect', 'useContext', 'useRef'],
    correctIndex: 2,
    explanation: 'useContext allows you to consume context values without wrapping components.',
    tags: ['react', 'hooks', 'context']
  },
  {
    category: 'react',
    difficulty: 'medium',
    prompt: 'What is the Virtual DOM in React?',
    options: ['A real DOM copy in memory', 'A lightweight JavaScript representation of the actual DOM', 'A browser API', 'A CSS framework'],
    correctIndex: 1,
    explanation: 'The Virtual DOM is a programming concept where a virtual representation is synced with the real DOM through reconciliation.',
    tags: ['react', 'virtual-dom', 'performance']
  },

  // Node.js
  {
    category: 'nodejs',
    difficulty: 'easy',
    prompt: 'What is the purpose of package.json in a Node.js project?',
    options: ['To store CSS styles', 'To define project metadata and dependencies', 'To compile JavaScript', 'To create databases'],
    correctIndex: 1,
    explanation: 'package.json contains project metadata, dependencies, scripts, and configuration.',
    tags: ['nodejs', 'npm', 'package']
  },
  {
    category: 'nodejs',
    difficulty: 'easy',
    prompt: 'Which module system does Node.js use by default?',
    options: ['ES Modules', 'CommonJS', 'AMD', 'UMD'],
    correctIndex: 1,
    explanation: 'Node.js traditionally uses CommonJS (require/module.exports), though ES Modules are now supported.',
    tags: ['nodejs', 'modules', 'commonjs']
  },
  {
    category: 'nodejs',
    difficulty: 'medium',
    prompt: 'What is the event loop in Node.js responsible for?',
    options: ['Compiling JavaScript', 'Handling asynchronous operations and callbacks', 'Managing memory allocation', 'Creating threads'],
    correctIndex: 1,
    explanation: 'The event loop allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel.',
    tags: ['nodejs', 'event-loop', 'async']
  },
  {
    category: 'nodejs',
    difficulty: 'medium',
    prompt: 'What is middleware in Express.js?',
    options: ['A database driver', 'Functions that have access to request/response objects in the request-response cycle', 'A templating engine', 'A CSS preprocessor'],
    correctIndex: 1,
    explanation: 'Middleware functions can execute code, modify request/response objects, end the cycle, or call the next middleware.',
    tags: ['nodejs', 'express', 'middleware']
  },
  {
    category: 'nodejs',
    difficulty: 'medium',
    prompt: 'What is the purpose of the "process.env" object in Node.js?',
    options: ['To manage DOM events', 'To access environment variables', 'To create child processes', 'To handle errors'],
    correctIndex: 1,
    explanation: 'process.env provides access to environment variables for configuration.',
    tags: ['nodejs', 'environment', 'config']
  },
  {
    category: 'nodejs',
    difficulty: 'hard',
    prompt: 'What is the difference between process.nextTick() and setImmediate()?',
    options: ['They are identical', 'nextTick() executes before I/O events, setImmediate() after', 'setImmediate() runs synchronously', 'nextTick() is deprecated'],
    correctIndex: 1,
    explanation: 'process.nextTick() fires before any I/O events, while setImmediate() executes in the check phase after I/O events.',
    tags: ['nodejs', 'event-loop', 'timing']
  },
  {
    category: 'nodejs',
    difficulty: 'easy',
    prompt: 'Which command installs a package and saves it to dependencies in package.json?',
    options: ['npm add', 'npm install <package>', 'npm get', 'npm fetch'],
    correctIndex: 1,
    explanation: 'npm install (or npm i) installs packages and adds them to dependencies by default.',
    tags: ['nodejs', 'npm', 'packages']
  },
  {
    category: 'nodejs',
    difficulty: 'medium',
    prompt: 'What is the purpose of the Buffer class in Node.js?',
    options: ['To handle CSS', 'To handle binary data', 'To create animations', 'To validate forms'],
    correctIndex: 1,
    explanation: 'Buffer provides a way to work with binary data directly in Node.js, useful for file operations and network protocols.',
    tags: ['nodejs', 'buffer', 'binary']
  },

  // General
  {
    category: 'general',
    difficulty: 'easy',
    prompt: 'What does API stand for?',
    options: ['Application Programming Interface', 'Advanced Programming Integration', 'Automated Program Interaction', 'Application Process Integration'],
    correctIndex: 0,
    explanation: 'API stands for Application Programming Interface, a set of rules allowing different software to communicate.',
    tags: ['general', 'api', 'basics']
  },
  {
    category: 'general',
    difficulty: 'easy',
    prompt: 'What is version control used for in software development?',
    options: ['To increase processing speed', 'To track changes to code over time and enable collaboration', 'To compile programs', 'To design user interfaces'],
    correctIndex: 1,
    explanation: 'Version control systems like Git help track code history, collaborate, and manage different versions.',
    tags: ['general', 'git', 'version-control']
  },
  {
    category: 'general',
    difficulty: 'medium',
    prompt: 'What is the purpose of a RESTful API?',
    options: ['To create desktop applications', 'To provide a stateless communication protocol between client and server', 'To compile code', 'To manage databases only'],
    correctIndex: 1,
    explanation: 'REST is an architectural style for web services using HTTP methods and stateless communication.',
    tags: ['general', 'rest', 'api']
  },
  {
    category: 'general',
    difficulty: 'medium',
    prompt: 'What is continuous integration (CI)?',
    options: ['A type of database', 'A practice of automatically building and testing code changes frequently', 'A programming language', 'A design pattern'],
    correctIndex: 1,
    explanation: 'CI involves automatically building and testing code when changes are committed to catch issues early.',
    tags: ['general', 'ci', 'devops']
  },
  {
    category: 'general',
    difficulty: 'medium',
    prompt: 'What is the main purpose of unit testing?',
    options: ['To test the entire application end-to-end', 'To test individual components or functions in isolation', 'To test network connectivity', 'To test user interfaces only'],
    correctIndex: 1,
    explanation: 'Unit tests verify individual units of code work correctly in isolation, catching bugs early.',
    tags: ['general', 'testing', 'unit-tests']
  },
  {
    category: 'general',
    difficulty: 'hard',
    prompt: 'What is technical debt?',
    options: ['Money owed to software vendors', 'The implied cost of future refactoring due to choosing quick solutions over better approaches', 'The cost of cloud hosting', 'A type of software license'],
    correctIndex: 1,
    explanation: 'Technical debt represents the future cost of rework needed when shortcuts are taken in development.',
    tags: ['general', 'technical-debt', 'engineering']
  },
  {
    category: 'general',
    difficulty: 'easy',
    prompt: 'What does IDE stand for?',
    options: ['Internet Development Environment', 'Integrated Development Environment', 'Interactive Design Editor', 'Internal Database Engine'],
    correctIndex: 1,
    explanation: 'IDE stands for Integrated Development Environment, software for building applications with tools like code editor, debugger, etc.',
    tags: ['general', 'tools', 'ide']
  },
  {
    category: 'general',
    difficulty: 'medium',
    prompt: 'What is the purpose of code review in software development?',
    options: ['To slow down development', 'To catch bugs, share knowledge, and maintain code quality', 'To assign blame for errors', 'To replace testing'],
    correctIndex: 1,
    explanation: 'Code reviews help find issues early, spread knowledge across the team, and ensure consistent quality standards.',
    tags: ['general', 'code-review', 'collaboration']
  }
];

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerPrep AI';
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

  console.log(`Quick Mock seed complete: inserted ${inserted}, already-existed ${matched}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
