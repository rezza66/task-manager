import React from 'react';
import { Search, Filter } from 'lucide-react';

const TaskFilters = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          className="input pl-10"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <select
        className="input w-full sm:w-auto"
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Priority Filter */}
      <select
        className="input w-full sm:w-auto"
        value={filters.priority}
        onChange={(e) => handleFilterChange('priority', e.target.value)}
      >
        <option value="all">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      {/* Sort */}
      <select
        className="input w-full sm:w-auto"
        value={filters.sort_field}
        onChange={(e) => handleFilterChange('sort_field', e.target.value)}
      >
        <option value="created_at">Created Date</option>
        <option value="due_date">Due Date</option>
        <option value="title">Title</option>
        <option value="priority">Priority</option>
      </select>

      <select
        className="input w-full sm:w-auto"
        value={filters.sort_direction}
        onChange={(e) => handleFilterChange('sort_direction', e.target.value)}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
};

export default TaskFilters;