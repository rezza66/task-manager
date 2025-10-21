import { useState, useEffect } from 'react';
import { Download, Trash2, FileText, AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';
import { reportsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout/Layout';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getAll();
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId) => {
    setDownloading(reportId);
    try {
      const response = await reportsAPI.download(reportId);
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from content-disposition header or use default
      const filename = report.filename || `report_${reportId}.${report.report_type}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await reportsAPI.delete(reportId);
      setReports(prev => prev.filter(report => report.id !== reportId));
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete report');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      processing: { icon: Clock, color: 'text-yellow-600' },
      completed: { icon: CheckCircle, color: 'text-green-600' },
      failed: { icon: AlertCircle, color: 'text-red-600' }
    };
    
    const { icon: Icon, color } = icons[status] || icons.processing;
    return <Icon className={`h-5 w-5 ${color}`} />;
  };

  const getStatusText = (status) => {
    const texts = {
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed'
    };
    
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generated Reports</h1>
          <p className="text-gray-600 mt-2">View and download your previously generated reports</p>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
            <p className="text-gray-600">
              Generate your first report from the Dashboard page
            </p>
          </div>
        ) : (
          <div className="card p-6">
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <FileText className="h-8 w-8 text-gray-400" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          Task Report ({report.report_type.toUpperCase()})
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          report.report_type === 'csv' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {report.report_type.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Generated {formatDate(report.created_at)}</span>
                        
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(report.status)}
                          <span>{getStatusText(report.status)}</span>
                        </div>

                        {report.filters && (
                          <span>
                            {Object.entries(report.filters)
                              .filter(([key, value]) => value && key !== 'report_type')
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </span>
                        )}
                      </div>

                      {report.error_message && (
                        <p className="text-sm text-red-600 mt-1">
                          Error: {report.error_message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {report.status === 'completed' && (
                      <button
                        onClick={() => handleDownload(report.id)}
                        disabled={downloading === report.id}
                        className="btn btn-primary text-sm flex items-center space-x-1"
                      >
                        {downloading === report.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span>Download</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );
};

export default Reports;