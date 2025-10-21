import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Edit3, 
  Trash2, 
  User, 
  MoreVertical,
  Check,
  X,
  Loader
} from 'lucide-react';
import { commentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const TaskComments = ({ taskId, comments: initialComments, onUpdate }) => {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingLoading, setEditingLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const { user } = useAuth();
  const toast = useToast();
  const commentsEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (initialComments) {
      setComments(initialComments);
    } else {
      fetchComments();
    }
  }, [taskId, initialComments]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getByTask(taskId);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const response = await commentsAPI.create(taskId, newComment);
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
      onUpdate();
      toast.success('Comment added successfully');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add comment';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setEditingLoading(true);
    try {
      const response = await commentsAPI.update(commentId, editText);
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? response.data.comment : comment
      ));
      setEditingComment(null);
      setEditText('');
      setActiveMenu(null);
      onUpdate();
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update comment';
      toast.error(errorMessage);
    } finally {
      setEditingLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsAPI.delete(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setActiveMenu(null);
      onUpdate();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete comment';
      toast.error(errorMessage);
    }
  };

  const startEditing = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.comment);
    setActiveMenu(null);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleTextareaChange = (e) => {
    setNewComment(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleEditTextareaChange = (e) => {
    setEditText(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserColor = (userId) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-orange-500', 'bg-teal-500', 'bg-cyan-500', 'bg-indigo-500'
    ];
    const index = userId % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <MessageCircle className="h-6 w-6 text-gray-600" />
        <div>
          <h4 className="font-semibold text-gray-900">Comments</h4>
          <p className="text-sm text-gray-500">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex space-x-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {user ? (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getUserColor(user.id)}`}>
              {getUserInitials(user.name)}
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="flex-1 space-y-3">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleTextareaChange}
            placeholder="Add a comment..."
            rows="3"
            className="input resize-none min-h-[80px]"
            disabled={loading}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || loading}
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{loading ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No comments yet</p>
            <p className="text-sm">Be the first to comment on this task</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isAuthor = user && comment.user_id === user.id;
            const isEditing = editingComment === comment.id;
            
            return (
              <div key={comment.id} className="flex space-x-4 group">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getUserColor(comment.user_id)}`}>
                    {getUserInitials(comment.user?.name || 'UU')}
                  </div>
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg p-4 relative">
                    {/* Comment Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.user?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                        {comment.created_at !== comment.updated_at && (
                          <span className="text-xs text-gray-400">(edited)</span>
                        )}
                      </div>

                      {/* Comment Actions */}
                      {isAuthor && !isEditing && (
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === comment.id ? null : comment.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {activeMenu === comment.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => startEditing(comment)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <Edit3 className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Comment Text */}
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editText}
                          onChange={handleEditTextareaChange}
                          rows="3"
                          className="input resize-none text-sm w-full"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={editingLoading}
                            className="btn btn-primary text-xs py-1 px-3 flex items-center space-x-1 disabled:opacity-50"
                          >
                            {editingLoading ? (
                              <Loader className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            <span>{editingLoading ? 'Saving...' : 'Save'}</span>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="btn btn-secondary text-xs py-1 px-3 flex items-center space-x-1"
                          >
                            <X className="h-3 w-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {comment.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>
    </div>
  );
};

export default TaskComments;