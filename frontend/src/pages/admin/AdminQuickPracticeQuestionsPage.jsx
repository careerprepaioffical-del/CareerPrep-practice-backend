import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../../utils/api';

const empty = {
  category: 'dsa',
  difficulty: 'easy',
  prompt: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  tagsCsv: ''
};

const AdminQuickPracticeQuestionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [form, setForm] = useState(empty);

  const canSubmit = useMemo(() => {
    const promptOk = form.prompt.trim().length > 0;
    const opts = (form.options || []).map((x) => String(x || '').trim()).filter(Boolean);
    return promptOk && opts.length >= 2;
  }, [form]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiMethods.admin.quickPracticeQuestions.list({
        q: query || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        limit: 100,
        page: 1
      });
      setItems(res?.data?.data?.items || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOption = (idx, value) => {
    const next = [...(form.options || [])];
    next[idx] = value;
    setForm((prev) => ({ ...prev, options: next }));
  };

  const create = async () => {
    if (!canSubmit) return;

    setSaving(true);
    try {
      const tags = String(form.tagsCsv || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

      const payload = {
        category: form.category,
        difficulty: form.difficulty,
        prompt: form.prompt,
        options: (form.options || []).map((x) => String(x || '').trim()).filter(Boolean),
        correctIndex: Number(form.correctIndex),
        explanation: form.explanation,
        tags
      };

      await apiMethods.admin.quickPracticeQuestions.create(payload);
      toast.success('Question added');
      setForm(empty);
      fetchItems();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await apiMethods.admin.quickPracticeQuestions.remove(id);
      toast.success('Deleted');
      fetchItems();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete');
    }
  };

  const downloadCsvTemplate = () => {
    const header = [
      'category',
      'difficulty',
      'prompt',
      'option1',
      'option2',
      'option3',
      'option4',
      'correctIndex',
      'explanation',
      'tags'
    ].join(',');

    const example = [
      'dsa',
      'easy',
      'Which data structure combination is commonly used to implement an LRU cache with O(1) average operations?',
      'Array',
      'HashMap + Doubly Linked List',
      'Binary Search Tree',
      'Stack',
      '1',
      'Use a HashMap for fast lookup and a doubly linked list to maintain recent-to-old order.',
      'dsa,hashmap,linked-list'
    ]
      .map((x) => `"${String(x).replace(/"/g, '""')}"`)
      .join(',');

    const csv = `${header}\n${example}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quick-practice-questions-template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importQuestions = async () => {
    if (!importFile) {
      toast.error('Please choose a CSV/XLSX file');
      return;
    }

    setImporting(true);
    try {
      const res = await apiMethods.admin.quickPracticeQuestions.importFile(importFile);
      const data = res?.data?.data;
      const inserted = data?.inserted ?? 0;
      const failed = data?.failed ?? 0;
      toast.success(`Imported ${inserted} questions${failed ? ` (${failed} failed)` : ''}`);
      setImportFile(null);
      fetchItems();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Quick Practice Question Bank</h1>
          <p className="text-secondary-600">Add professional interview-style MCQ questions for mock tests.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchItems} disabled={loading}>Refresh</button>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">Bulk Upload (CSV / Excel)</h3>
            <p className="text-sm text-secondary-600 mt-1">
              Upload 100+ questions at once. Supported: .csv, .xlsx, .xls
            </p>
          </div>
          <button className="btn btn-secondary" onClick={downloadCsvTemplate}>Download CSV Template</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-2">File</label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="input"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            <div className="text-xs text-secondary-500 mt-1">
              Columns supported: category, difficulty, prompt, option1..option8 OR options (pipe-separated), correctIndex (0-based or 1-based), explanation, tags
            </div>
          </div>
          <button className="btn btn-primary" onClick={importQuestions} disabled={importing || !importFile}>
            {importing ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Add Question</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
              <option value="dsa">DSA</option>
              <option value="oop">OOP</option>
              <option value="dbms">DBMS</option>
              <option value="os">Operating Systems</option>
              <option value="networks">Computer Networks</option>
              <option value="system-design">System Design</option>
              <option value="behavioral">Behavioral</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Difficulty</label>
            <select className="input" value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Correct Option</label>
            <select
              className="input"
              value={form.correctIndex}
              onChange={(e) => setForm((p) => ({ ...p, correctIndex: parseInt(e.target.value, 10) }))}
            >
              {[0, 1, 2, 3].map((i) => (
                <option key={i} value={i}>Option {i + 1}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Prompt</label>
          <textarea
            className="input min-h-[96px]"
            value={form.prompt}
            onChange={(e) => setForm((p) => ({ ...p, prompt: e.target.value }))}
            placeholder="Enter the question"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.options.map((opt, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Option {idx + 1}</label>
              <input
                className="input"
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Explanation (optional)</label>
          <textarea
            className="input min-h-[80px]"
            value={form.explanation}
            onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
            placeholder="Why is this correct?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Tags (comma-separated)</label>
          <input
            className="input"
            value={form.tagsCsv}
            onChange={(e) => setForm((p) => ({ ...p, tagsCsv: e.target.value }))}
            placeholder="dom, events, flexbox"
          />
        </div>

        <button className="btn btn-primary" onClick={create} disabled={!canSubmit || saving}>
          {saving ? 'Saving…' : 'Add Question'}
        </button>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h3 className="text-lg font-semibold text-secondary-900">Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
            <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" />
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="dsa">DSA</option>
              <option value="oop">OOP</option>
              <option value="dbms">DBMS</option>
              <option value="os">Operating Systems</option>
              <option value="networks">Computer Networks</option>
              <option value="system-design">System Design</option>
              <option value="behavioral">Behavioral</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="javascript">JavaScript</option>
            </select>
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button className="btn btn-secondary md:col-span-3" onClick={fetchItems}>Apply Filters</button>
          </div>
        </div>

        {loading ? (
          <div className="text-secondary-600">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-secondary-600">No questions yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((q) => (
              <div key={q._id} className="border border-secondary-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase text-secondary-500">{q.category} • {q.difficulty}</div>
                    <div className="font-medium text-secondary-900 mt-1">{q.prompt}</div>
                    <ol className="list-decimal ml-5 mt-2 text-sm text-secondary-800">
                      {(q.options || []).map((o, i) => (
                        <li key={i} className={i === q.correctIndex ? 'text-success-700 font-medium' : ''}>{o}</li>
                      ))}
                    </ol>
                  </div>
                  <button className="btn btn-secondary" onClick={() => remove(q._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuickPracticeQuestionsPage;
