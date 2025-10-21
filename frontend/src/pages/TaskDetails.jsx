import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Flag, 
  Paperclip, 
  MessageCircle,
  Clock,
  PlayCircle,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { tasksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import TaskAttachments from '../components/Tasks/TaskAttachments';
import TaskComments from '../components/Tasks/TaskComments';
import Layout from '../components/Layout/Layout';
import TaskModal from '../components/Tasks/TaskModal';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getById(id);
      setTask(response.data);
    } catch (error) {
      console.error('Error fetching task details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load task details';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      await tasksAPI.delete(id);
      toast.success('Task deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting task:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      toast.error(errorMessage);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await tasksAPI.update(id, { status: newStatus });
      setTask(response.data.task);
      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Pending'
      },
      in_progress: {
        icon: PlayCircle,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'In Progress'
      },
      completed: {
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Completed'
      }
    };
    return configs[status] || configs.pending;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: {
        color: 'bg-green-100 text-green-800',
        label: 'Low'
      },
      medium: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Medium'
      },
      high: {
        color: 'bg-red-100 text-red-800',
        label: 'High'
      }
    };
    return configs[priority] || configs.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRelativeDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    
    return '';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading task details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !task) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {error || 'The task you are looking for does not exist or you do not have permission to view it.'}
          </p>
          <div className="space-x-4">
            <Link to="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
            <button onClick={fetchTaskDetails} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const StatusIcon = statusConfig.icon;
  
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  const canEdit = user && (task.user_id === user.id || task.assigned_to === user.id);
  const canDelete = user && task.user_id === user.id;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Quick Actions */}
            {canEdit && (
              <div className="flex items-center space-x-2">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="input text-sm w-auto"
                >
                  <option value="pending">🟡 Pending</option>
                  <option value="in_progress">🔵 In Progress</option>
                  <option value="completed">🟢 Completed</option>
                </select>
              </div>
            )}

            {/* Action Menu */}
            <div className="relative">
              <button
                onClick={() => setActionMenuOpen(!actionMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              
              {actionMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setActionMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Task</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        handleDeleteTask();
                        setActionMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Task</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Header Card */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`h-6 w-6 ${statusConfig.color.replace('bg-', 'text-').split(' ')[0]}`} />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.color}`}>
                        {priorityConfig.label} Priority
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Paperclip className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{task.attachments?.length || 0}</p>
                  <p className="text-sm text-gray-500">Attachments</p>
                </div>
                <div className="text-center">
                  <MessageCircle className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{task.comments?.length || 0}</p>
                  <p className="text-sm text-gray-500">Comments</p>
                </div>
                <div className="text-center">
                  <User className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-900">{task.assignee ? task.assignee.name : 'Unassigned'}</p>
                  <p className="text-sm text-gray-500">Assigned To</p>
                </div>
                <div className="text-center">
                  <Calendar className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-900">
                    {task.due_date ? getRelativeDate(task.due_date) : 'No due date'}
                  </p>
                  <p className="text-sm text-gray-500">Due Date</p>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="card p-6">
              <TaskAttachments 
                taskId={task.id} 
                attachments={task.attachments} 
                onUpdate={fetchTaskDetails}
              />
            </div>

            {/* Comments Section */}
            <div className="card p-6">
              <TaskComments 
                taskId={task.id} 
                comments={task.comments} 
                onUpdate={fetchTaskDetails}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Task Meta Information */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Task Information</h3>
              <div className="space-y-4">
                {/* Due Date */}
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                    <p className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                      {formatDate(task.due_date)}
                      {isOverdue && ' (Overdue)'}
                    </p>
                  </div>
                </div>

                {/* Assignee */}
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Assigned To</p>
                    <p className="text-sm text-gray-900">
                      {task.assignee ? task.assignee.name : 'Unassigned'}
                    </p>
                    {task.assignee && (
                      <p className="text-xs text-gray-500">{task.assignee.email}</p>
                    )}
                  </div>
                </div>

                {/* Created By */}
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created By</p>
                    <p className="text-sm text-gray-900">{task.user.name}</p>
                    <p className="text-xs text-gray-500">{task.user.email}</p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(task.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {new Date(task.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {canEdit && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-full btn btn-primary flex items-center space-x-2 justify-center"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Task</span>
                  </button>
                  
                  {canDelete && (
                    <button
                      onClick={handleDeleteTask}
                      className="w-full btn btn-danger flex items-center space-x-2 justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Task</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <TaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            fetchTaskDetails();
          }}
        />
      )}
    </Layout>
  );
};

export default TaskDetails;