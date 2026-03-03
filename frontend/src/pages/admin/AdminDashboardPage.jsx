import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-secondary-200 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-secondary-900">Admin Panel</h1>
          <p className="text-secondary-600 mt-2">
            You’re signed in as an admin. This is a starter admin area.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-secondary-900">Question Bank</h2>
                <Link to="/admin/coding-questions" className="btn btn-primary text-sm">
                  Open
                </Link>
              </div>
              <p className="text-sm text-secondary-600 mt-1">
                Create and manage coding questions and mock MCQs.
              </p>
            </div>

            <div className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-secondary-900">Quick Practice Bank</h2>
                <Link to="/admin/quick-practice-questions" className="btn btn-primary text-sm">
                  Open
                </Link>
              </div>
              <p className="text-sm text-secondary-600 mt-1">
                Add HTML/CSS/JavaScript interview MCQs used in random tests.
              </p>
            </div>

            <div className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-secondary-900">Preparation Sheet Bank</h2>
                <Link to="/admin/preparation-sheet" className="btn btn-primary text-sm">
                  Open
                </Link>
              </div>
              <p className="text-sm text-secondary-600 mt-1">
                Post question links so users can tick/untick and track full sheet completion.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-secondary-50 border border-secondary-200 rounded-lg p-4">
            <p className="text-sm text-secondary-700">
              Next step: add admin-only APIs and connect this UI to them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
