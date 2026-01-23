import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../../utils/api';

const emptyQuestion = {
  source: 'leetcode',
  sourceId: '',
  sourceUrl: '',
  title: '',
  difficulty: 'easy',
  description: '',
  constraints: '',
  examples: [{ input: '', output: '', explanation: '' }],
  testCases: [
    { input: '', expectedOutput: '', isHidden: false },
    { input: '', expectedOutput: '', isHidden: true }
  ],
  starterCode: {
    javascript: '',
    python: '',
    java: '',
    cpp: ''
  },
  tags: [],
  hints: []
};

const splitCsv = (value) =>
  String(value || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const toTitleCase = (value) =>
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const parseLeetCodeRef = (raw) => {
  const text = String(raw || '').trim();
  if (!text) return null;

  // If user pasted a number like "1"
  if (/^\d+$/.test(text)) {
    return { sourceId: text, sourceUrl: '' };
  }

  // If user pasted a URL, try to extract the slug: /problems/<slug>/
  try {
    const url = new URL(text);
    const m = url.pathname.match(/\/problems\/([^/]+)\/?/);
    if (m && m[1]) {
      const slug = m[1];
      return {
        sourceId: slug,
        sourceUrl: `https://leetcode.com/problems/${slug}/`
      };
    }
    // Not a problems URL; keep the URL anyway
    return { sourceId: '', sourceUrl: url.toString() };
  } catch {
    // If user pasted a slug like "two-sum"
    if (/^[a-z0-9-]+$/.test(text)) {
      return {
        sourceId: text,
        sourceUrl: `https://leetcode.com/problems/${text}/`
      };
    }
    return null;
  }
};

const AdminCodingQuestionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const [editingId, setEditingId] = useState(null);

  const [leetCodeRef, setLeetCodeRef] = useState('');

  const [form, setForm] = useState(emptyQuestion);
  const [tagsCsv, setTagsCsv] = useState('');
  const [hintsCsv, setHintsCsv] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiMethods.admin.codingQuestions.list({
        q: query || undefined,
        difficulty: difficulty || undefined
      });
      setItems(res.data.data.items || []);
    } catch (e) {
      if (!e?.response) return; // axios interceptor already shows a network toast
      toast.error(e?.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(() => {
    const hasAtLeastOneValidTest = (form.testCases || []).some(
      (t) => t.input?.trim() && t.expectedOutput?.trim()
    );
    return form.title.trim() && form.description.trim() && hasAtLeastOneValidTest;
  }, [form]);

  const updateExample = (index, key, value) => {
    const next = [...form.examples];
    next[index] = { ...next[index], [key]: value };
    setForm({ ...form, examples: next });
  };

  const addExample = () => setForm({ ...form, examples: [...form.examples, { input: '', output: '', explanation: '' }] });
  const removeExample = (index) => setForm({ ...form, examples: form.examples.filter((_, i) => i !== index) });

  const updateTest = (index, key, value) => {
    const next = [...form.testCases];
    next[index] = { ...next[index], [key]: value };
    setForm({ ...form, testCases: next });
  };

  const addTest = () => setForm({ ...form, testCases: [...form.testCases, { input: '', expectedOutput: '', isHidden: false }] });
  const removeTest = (index) => setForm({ ...form, testCases: form.testCases.filter((_, i) => i !== index) });

  const buildPayload = () => {
    return {
      ...form,
      tags: splitCsv(tagsCsv),
      hints: splitCsv(hintsCsv),
      // Remove empty examples/tests for cleaner storage
      examples: (form.examples || []).filter((ex) => ex.input.trim() || ex.output.trim() || ex.explanation.trim()),
      testCases: (form.testCases || []).filter((tc) => tc.input.trim() && tc.expectedOutput.trim())
    };
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyQuestion);
    setTagsCsv('');
    setHintsCsv('');
    setLeetCodeRef('');
  };

  const onAutofillLeetCode = () => {
    const parsed = parseLeetCodeRef(leetCodeRef);
    if (!parsed) {
      toast.error('Paste a LeetCode problem link, slug, or number');
      return;
    }

    const next = {
      ...form,
      source: 'leetcode',
      sourceId: parsed.sourceId || form.sourceId,
      sourceUrl: parsed.sourceUrl || form.sourceUrl
    };

    // If we have a slug and title is empty, generate a nice title
    if (!form.title.trim() && parsed.sourceId && !/^\d+$/.test(parsed.sourceId)) {
      next.title = toTitleCase(parsed.sourceId);
    }

    setForm(next);
    toast.success('Auto-filled LeetCode fields');
  };

  const generateStarterCode = () => {
    const isTwoSum =
      String(form.sourceId || '').toLowerCase() === 'two-sum' ||
      String(form.title || '').toLowerCase().includes('two sum');

    const js = isTwoSum
      ? `function solution(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
  return [];
}`
      : `function solution(...args) {
  return null;
}`;

    const py = isTwoSum
      ? `def solution(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []`
      : `def solution(*args):
    return None`;

    const java = `import java.util.*;

public class Main {
  public static void main(String[] args) throws Exception {
  }
}`;

    const cpp = `#include <bits/stdc++.h>
using namespace std;

int main() {
  return 0;
}`;

    setForm({
      ...form,
      starterCode: {
        ...(form.starterCode || {}),
        javascript: js,
        python: py,
        java,
        cpp
      }
    });
    toast.success('Starter code generated');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error('Please add title, description, and at least 1 valid test case');
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();

      if (editingId) {
        await apiMethods.admin.codingQuestions.update(editingId, payload);
        toast.success('Question updated');
      } else {
        await apiMethods.admin.codingQuestions.create(payload);
        toast.success('Question added');
      }

      resetForm();
      await fetchItems();
    } catch (err) {
      if (!err?.response) return; // axios interceptor already shows a network toast

      const apiMessage = err?.response?.data?.message;
      const apiErrors = err?.response?.data?.errors;
      const firstValidation = Array.isArray(apiErrors) && apiErrors.length
        ? apiErrors[0]?.message || apiErrors[0]?.msg
        : '';

      toast.error(firstValidation || apiMessage || (editingId ? 'Failed to update question' : 'Failed to create question'));
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (q) => {
    setEditingId(q._id);
    setForm({
      source: q.source || 'custom',
      sourceId: q.sourceId || '',
      sourceUrl: q.sourceUrl || '',
      title: q.title || '',
      difficulty: q.difficulty || 'easy',
      description: q.description || '',
      constraints: q.constraints || '',
      examples: (q.examples && q.examples.length ? q.examples : [{ input: '', output: '', explanation: '' }]).map((ex) => ({
        input: ex.input || '',
        output: ex.output || '',
        explanation: ex.explanation || ''
      })),
      testCases: (q.testCases && q.testCases.length ? q.testCases : [{ input: '', expectedOutput: '', isHidden: false }]).map((tc) => ({
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        isHidden: !!tc.isHidden
      })),
      starterCode: {
        javascript: q?.starterCode?.javascript || '',
        python: q?.starterCode?.python || '',
        java: q?.starterCode?.java || '',
        cpp: q?.starterCode?.cpp || ''
      },
      tags: q.tags || [],
      hints: q.hints || []
    });
    setTagsCsv((q.tags || []).join(', '));
    setHintsCsv((q.hints || []).join(', '));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await apiMethods.admin.codingQuestions.remove(id);
      toast.success('Deleted');
      await fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">LeetCode / Coding Questions</h1>
          <p className="text-secondary-600 mt-1">Add simple coding questions with test cases (admin-only).</p>
        </div>
      </div>

      {/* Create form */}
      <form onSubmit={onSubmit} className="mt-6 bg-white border border-secondary-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              LeetCode link / slug / number (auto-fill)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="input w-full"
                value={leetCodeRef}
                onChange={(e) => setLeetCodeRef(e.target.value)}
                placeholder="https://leetcode.com/problems/two-sum/  OR  two-sum  OR  1"
              />
              <button type="button" className="btn btn-secondary" onClick={onAutofillLeetCode}>
                Auto-fill
              </button>
            </div>
            <p className="text-xs text-secondary-500 mt-1">
              This fills URL/slug/title only (no scraping).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Source</label>
            <select
              className="input w-full"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            >
              <option value="leetcode">LeetCode</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Difficulty</label>
            <select
              className="input w-full"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">LeetCode ID (optional)</label>
            <input
              className="input w-full"
              value={form.sourceId}
              onChange={(e) => setForm({ ...form, sourceId: e.target.value })}
              placeholder="e.g. 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">LeetCode URL (optional)</label>
            <input
              className="input w-full"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              placeholder="https://leetcode.com/problems/two-sum/"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1">Title</label>
            <input
              className="input w-full"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Two Sum"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
            <textarea
              className="input w-full min-h-[140px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Paste the problem statement here"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1">Constraints (optional)</label>
            <textarea
              className="input w-full min-h-[80px]"
              value={form.constraints}
              onChange={(e) => setForm({ ...form, constraints: e.target.value })}
              placeholder="One per line"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Tags (optional)</label>
            <input
              className="input w-full"
              value={tagsCsv}
              onChange={(e) => setTagsCsv(e.target.value)}
              placeholder="array, hash-map, two-pointers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Hints (optional)</label>
            <input
              className="input w-full"
              value={hintsCsv}
              onChange={(e) => setHintsCsv(e.target.value)}
              placeholder="Use a map, Think about complements"
            />
          </div>
        </div>

        {/* Examples */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">Examples</h2>
            <button type="button" className="btn btn-ghost" onClick={addExample}>Add Example</button>
          </div>
          <div className="mt-3 space-y-3">
            {form.examples.map((ex, idx) => (
              <div key={idx} className="border border-secondary-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="input"
                    value={ex.input}
                    onChange={(e) => updateExample(idx, 'input', e.target.value)}
                    placeholder="Input"
                  />
                  <input
                    className="input"
                    value={ex.output}
                    onChange={(e) => updateExample(idx, 'output', e.target.value)}
                    placeholder="Output"
                  />
                  <input
                    className="input"
                    value={ex.explanation}
                    onChange={(e) => updateExample(idx, 'explanation', e.target.value)}
                    placeholder="Explanation (optional)"
                  />
                </div>
                {form.examples.length > 1 && (
                  <button type="button" className="btn btn-ghost mt-2" onClick={() => removeExample(idx)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Test cases */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">Test Cases</h2>
            <button type="button" className="btn btn-ghost" onClick={addTest}>Add Test</button>
          </div>
          <p className="text-sm text-secondary-600 mt-1">
            For JS/Python, inputs are the same format you already use (e.g. "[2,7,11,15], 9").
          </p>

          <div className="mt-3 space-y-3">
            {form.testCases.map((tc, idx) => (
              <div key={idx} className="border border-secondary-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5">
                    <label className="block text-xs text-secondary-600 mb-1">Input</label>
                    <input
                      className="input w-full"
                      value={tc.input}
                      onChange={(e) => updateTest(idx, 'input', e.target.value)}
                      placeholder="[2,7,11,15], 9"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs text-secondary-600 mb-1">Expected Output</label>
                    <input
                      className="input w-full"
                      value={tc.expectedOutput}
                      onChange={(e) => updateTest(idx, 'expectedOutput', e.target.value)}
                      placeholder="[0,1]"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                    <label className="flex items-center gap-2 text-sm text-secondary-700">
                      <input
                        type="checkbox"
                        checked={!!tc.isHidden}
                        onChange={(e) => updateTest(idx, 'isHidden', e.target.checked)}
                      />
                      Hidden
                    </label>
                    {form.testCases.length > 1 && (
                      <button type="button" className="btn btn-ghost" onClick={() => removeTest(idx)}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Starter code */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">Starter Code</h2>
            <button type="button" className="btn btn-secondary" onClick={generateStarterCode}>
              Generate
            </button>
          </div>
          <p className="text-sm text-secondary-600 mt-1">
            This will prefill the coding editor. For JS/Python grading, use <span className="font-medium">solution</span> as the function name.
          </p>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">JavaScript</label>
              <textarea
                className="input w-full min-h-[180px] font-mono text-sm"
                value={form.starterCode?.javascript || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    starterCode: { ...(form.starterCode || {}), javascript: e.target.value }
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Python</label>
              <textarea
                className="input w-full min-h-[180px] font-mono text-sm"
                value={form.starterCode?.python || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    starterCode: { ...(form.starterCode || {}), python: e.target.value }
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Java</label>
              <textarea
                className="input w-full min-h-[180px] font-mono text-sm"
                value={form.starterCode?.java || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    starterCode: { ...(form.starterCode || {}), java: e.target.value }
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">C++</label>
              <textarea
                className="input w-full min-h-[180px] font-mono text-sm"
                value={form.starterCode?.cpp || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    starterCode: { ...(form.starterCode || {}), cpp: e.target.value }
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          {editingId ? (
            <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Question'}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-secondary-900">Existing Questions</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title"
            />
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">All difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button type="button" className="btn btn-secondary" onClick={fetchItems}>
              Filter
            </button>
          </div>
        </div>

        <div className="mt-4 bg-white border border-secondary-200 rounded-xl">
          {loading ? (
            <div className="p-6 text-secondary-600">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-secondary-600">No questions found.</div>
          ) : (
            <div className="divide-y divide-secondary-200">
              {items.map((q) => (
                <div key={q._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-secondary-900">{q.title}</div>
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary-100 text-secondary-700">{q.difficulty}</span>
                      {q.source === 'leetcode' && (
                        <span className="text-xs px-2 py-0.5 rounded bg-primary-50 text-primary-700">LeetCode</span>
                      )}
                    </div>
                    <div className="text-sm text-secondary-600 mt-1">
                      Tests: {(q.testCases || []).length} · Hidden: {(q.testCases || []).filter((t) => t.isHidden).length}
                    </div>
                    {q.sourceUrl ? (
                      <a className="text-sm text-primary-600 hover:underline" href={q.sourceUrl} target="_blank" rel="noreferrer">
                        {q.sourceUrl}
                      </a>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button type="button" className="btn btn-secondary" onClick={() => onEdit(q)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => onDelete(q._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCodingQuestionsPage;
