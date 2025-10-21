import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Flag, 
  Paperclip,
  MessageCircle,
  CheckCircle2,
  PlayCircle,
  Clock,
  Eye
} from 'lucide-react';
import { tasksAPI } from '../../services/api';

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onUpdate, 
  onSelect, 
  isSelected, 
  viewMode 
}) => {
  const [showAttachments, setShowAttachments] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const statusIcons = {
    pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
    in_progress: { icon: PlayCircle, color: 'text-blue-600 bg-blue-100' },
    completed: { icon: CheckCircle2, color: 'text-green-600 bg-green-100' }
  };

  const priorityColors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100'
  };

  const StatusIcon = statusIcons[task.status].icon;

  const handleStatusChange = async (newStatus) => {
    try {
      await tasksAPI.update(task.id, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  // List View
  if (viewMode === 'list') {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Selection Checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(task.id, e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
            )}

            {/* Status */}
            <button
              onClick={() => handleStatusChange(
                task.status === 'completed' ? 'pending' : 'completed'
              )}
              className="flex-shrink-0"
            >
              <StatusIcon className={`h-5 w-5 ${task.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`} />
            </button>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 truncate">{task.description}</p>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {/* Due Date */}
              {task.due_date && (
                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(task.due_date)}</span>
                </div>
              )}

              {/* Assignee */}
              {task.assignee && (
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{task.assignee.name}</span>
                </div>
              )}

              {/* Priority */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>
                <Flag className="h-3 w-3" />
                <span className="capitalize">{task.priority}</span>
              </div>

              {/* Attachments Count */}
              {task.attachments && task.attachments.length > 0 && (
                <button
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Paperclip className="h-4 w-4" />
                  <span>{task.attachments.length}</span>
                </button>
              )}

              {/* Comments Count */}
              {task.comments && task.comments.length > 0 && (
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{task.comments.length}</span>
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <Link
              to={`/tasks/${task.id}`}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit Task"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expanded Sections */}
        {showAttachments && (
          <div className="mt-4 border-t pt-4">
            {/* TaskAttachments component would go here */}
          </div>
        )}

        {showComments && (
          <div className="mt-4 border-t pt-4">
            {/* TaskComments component would go here */}
          </div>
        )}
      </div>
    );
  }

  // Grid View
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {/* Selection Checkbox */}
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(task.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
          )}
          
          <button
            onClick={() => handleStatusChange(
              task.status === 'completed' ? 'pending' : 'completed'
            )}
          >
            <StatusIcon className={`h-5 w-5 ${statusIcons[task.status].color}`} />
          </button>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <div className="flex space-x-1">
          <Link
            to={`/tasks/${task.id}`}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit Task"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {task.title}
        </h3>
        
        {task.description && (
          <p className="text-gray-600 text-sm line-clamp-3">{task.description}</p>
        )}

        {/* Meta Information */}
        <div className="space-y-2 text-sm text-gray-500">
          {/* Due Date */}
          {task.due_date && (
            <div className={`flex items-center space-x-2 ${isOverdue ? 'text-red-600' : ''}`}>
              <Calendar className="h-4 w-4" />
              <span>Due {formatDate(task.due_date)}</span>
            </div>
          )}

          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Assigned to {task.assignee.name}</span>
            </div>
          )}

          {/* Creator */}
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>By {task.user.name}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {task.attachments && task.attachments.length > 0 && (
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Paperclip className="h-4 w-4" />
              <span>{task.attachments.length}</span>
            </button>
          )}

          {task.comments && task.comments.length > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{task.comments.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Sections */}
      {showAttachments && (
        <div className="mt-4 border-t pt-4">
          {/* TaskAttachments component would go here */}
        </div>
      )}

      {showComments && (
        <div className="mt-4 border-t pt-4">
          {/* TaskComments component would go here */}
        </div>
      )}
    </div>
  );
};

export default TaskCard;