import React, { useState } from 'react';
import { Download, Edit3, Loader } from 'lucide-react';
import { tasksAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const BulkActions = ({ selectedTasks, onUpdate, onClearSelection }) => {
  const [loading, setLoading] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [bulkData, setBulkData] = useState({ status: '', priority: '' });
  const [reportFilters, setReportFilters] = useState({ report_type: 'csv' });
  const toast = useToast();

  if (selectedTasks.length === 0) return null;

  const handleBulkUpdate = async () => {
    if (!bulkData.status && !bulkData.priority) {
      toast.error('Please select at least one field to update');
      return;
    }

    setLoading(true);
    try {
      await tasksAPI.bulkUpdate({
        task_ids: selectedTasks,
        ...bulkData
      });

      toast.success('Bulk update started. Tasks will be updated in background.');
      setShowBulkUpdate(false);
      setBulkData({ status: '', priority: '' });
      onClearSelection();
    } catch (error) {
      toast.error('Failed to start bulk update');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await tasksAPI.generateReport(reportFilters);
      toast.success('Report generation started. You will be notified when ready.');
      setShowReportDialog(false);
      onClearSelection();
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowBulkUpdate(true)}
              className="btn btn-primary text-sm flex items-center space-x-1"
            >
              <Edit3 className="h-4 w-4" />
              <span>Bulk Update</span>
            </button>

            <button
              onClick={() => setShowReportDialog(true)}
              className="btn btn-secondary text-sm flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear Selection
        </button>
      </div>

      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Bulk Update Tasks</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={bulkData.status}
                  onChange={(e) => setBulkData(prev => ({ ...prev, status: e.target.value }))}
                  className="input"
                >
                  <option value="">No Change</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={bulkData.priority}
                  onChange={(e) => setBulkData(prev => ({ ...prev, priority: e.target.value }))}
                  className="input"
                >
                  <option value="">No Change</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBulkUpdate(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={loading}
                className="btn btn-primary flex items-center space-x-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                <span>Update {selectedTasks.length} Tasks</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Generate Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportFilters.report_type}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, report_type: e.target.value }))}
                  className="input"
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowReportDialog(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="btn btn-primary flex items-center space-x-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;