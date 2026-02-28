import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { apiMethods } from '../../utils/api';

const emptyForm = {
  title: '',
  questionUrl: '',
  topic: '',
  platform: '',
  difficulty: 'medium',
  order: 0,
  isActive: true
};

const AdminPreparationSheetPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await apiMethods.admin.preparationSheet.list({ includeInactive: true });
      setItems(res?.data?.data?.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load preparation sheet questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        order: Number(form.order) || 0
      };

      if (editingId) {
        await apiMethods.admin.preparationSheet.update(editingId, payload);
        toast.success('Question updated');
      } else {
        await apiMethods.admin.preparationSheet.create(payload);
        toast.success('Question created');
      }

      resetForm();
      await loadItems();
    } catch (err) {
      const message = err?.response?.data?.errors?.[0]?.message || err?.response?.data?.message || 'Failed to save question';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || '',
      questionUrl: item.questionUrl || '',
      topic: item.topic || '',
      platform: item.platform || '',
      difficulty: item.difficulty || 'medium',
      order: item.order || 0,
      isActive: item.isActive !== false
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this preparation sheet question?')) return;
    try {
      await apiMethods.admin.preparationSheet.remove(id);
      toast.success('Question deleted');
      await loadItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await apiMethods.admin.preparationSheet.upload(file);
      const { inserted, total, errors } = res?.data?.data || {};
      
      if (errors && errors.length > 0) {
        toast.error(`Uploaded ${inserted}/${total} questions. Some rows had errors.`);
        console.error('Upload errors:', errors);
      } else {
        toast.success(`Successfully uploaded ${inserted} question(s)`);
      }
      
      e.target.value = ''; // Reset file input
      await loadItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `title,questionUrl,topic,platform,difficulty,order,isActive
"Two Sum - Find pair that adds up to target","https://leetcode.com/problems/two-sum/","Arrays","LeetCode","easy",1,true
"Reverse Linked List","https://leetcode.com/problems/reverse-linked-list/","Linked Lists","LeetCode","medium",2,true
"Binary Tree Inorder Traversal","https://leetcode.com/problems/binary-tree-inorder-traversal/","Trees","LeetCode","easy",3,true`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preparation-sheet-sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Preparation Sheet Bank</h1>
        <p className="text-secondary-600 mt-1">Post question links for users to solve and track via checklist.</p>
      </div>

      {/* Bulk Upload Section */}
      <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-lg">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-secondary-900 mb-2">Bulk Upload Questions</h2>
            <p className="text-sm text-secondary-600 mb-4">
              Upload CSV or Excel file to add multiple questions at once. 
              Required columns: <strong>title</strong>, <strong>questionUrl</strong>. 
              Optional: topic, platform, difficulty, order, isActive.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <label className="btn btn-primary cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Choose File'}
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              
              <button
                type="button"
                onClick={downloadSampleCSV}
                className="btn btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Sample CSV
              </button>
              
              <span className="text-xs text-secondary-500">
                Max 5MB • CSV, XLS, XLSX
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          {editingId ? 'Edit Question' : 'Add Question'}
        </h2>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1">Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1">Question Link</label>
            <input
              className="input"
              type="url"
              value={form.questionUrl}
              onChange={(e) => onChange('questionUrl', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Topic</label>
            <input className="input" value={form.topic} onChange={(e) => onChange('topic', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Platform</label>
            <input className="input" value={form.platform} onChange={(e) => onChange('platform', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Difficulty</label>
            <select className="input" value={form.difficulty} onChange={(e) => onChange('difficulty', e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Order</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.order}
              onChange={(e) => onChange('order', e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => onChange('isActive', e.target.checked)}
            />
            <label htmlFor="isActive" className="text-sm text-secondary-700">Active</label>
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Questions</h2>

        {loading ? (
          <p className="text-secondary-600">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-secondary-600">No preparation sheet questions added yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="border border-secondary-200 rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-secondary-900 truncate">{item.title}</p>
                  <p className="text-xs text-secondary-600 mt-1">
                    {item.topic || 'General'} · {item.difficulty || 'medium'} · order {item.order || 0} · {item.isActive ? 'active' : 'inactive'}
                  </p>
                  <a href={item.questionUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-700 hover:text-primary-800">
                    {item.questionUrl}
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="btn btn-secondary" onClick={() => onEdit(item)}>Edit</button>
                  <button className="btn bg-error-600 text-white hover:bg-error-700" onClick={() => onDelete(item._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPreparationSheetPage;
