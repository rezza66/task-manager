import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Grid, List } from "lucide-react";
import { tasksAPI } from "../services/api";
import TaskCard from "../components/Tasks/TaskCard";
import TaskModal from "../components/Tasks/TaskModal";
import TaskFilters from "../components/Tasks/TaskFilters";
import BulkActions from "../components/Tasks/BulkActions";
import Layout from '../components/Layout/Layout';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    sort_field: "created_at",
    sort_direction: "desc",
  });
  const [viewMode, setViewMode] = useState("grid");
  const [selectedTasks, setSelectedTasks] = useState(new Set());

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll(filters);
      setTasks(response.data.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleTaskUpdate = () => {
    fetchTasks();
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await tasksAPI.delete(taskId);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };

  const handleTaskSelect = (taskId, isSelected) => {
    setSelectedTasks(prev => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(taskId);
      } else {
        newSelection.delete(taskId);
      }
      return newSelection;
    });
  };

  const handleBulkActionComplete = () => {
    setSelectedTasks(new Set());
    fetchTasks();
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    completed: tasks.filter((task) => task.status === "completed").length,
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
            <h1 className="text-3xl mb-12 font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your tasks efficiently</p>
            </div>
            <button
            onClick={handleCreateTask}
            className="btn btn-primary flex items-center space-x-2"
            >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
            </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-6">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                <Grid className="h-6 w-6 text-blue-600" />
                </div>
            </div>
            </div>

            <div className="card p-6">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="h-2 w-2 bg-yellow-600 rounded-full animate-pulse"></div>
                </div>
            </div>
            </div>

            <div className="card p-6">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                    {stats.inProgress}
                </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
            </div>
            </div>

            <div className="card p-6">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
                </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                </div>
            </div>
            </div>
        </div>

        {/* Bulk Actions */}
        <BulkActions 
            selectedTasks={Array.from(selectedTasks)}
            onUpdate={handleBulkActionComplete}
            onClearSelection={() => setSelectedTasks(new Set())}
        />

        {/* Filters and Controls */}
        <div className="card p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <TaskFilters filters={filters} onFiltersChange={setFilters} />

            <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                    viewMode === "grid" ? "bg-white shadow" : ""
                    }`}
                >
                    <Grid className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                    viewMode === "list" ? "bg-white shadow" : ""
                    }`}
                >
                    <List className="h-4 w-4" />
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* Tasks Grid/List */}
        {tasks.length === 0 ? (
            <div className="card p-12 text-center">
            <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks found
                </h3>
                <p className="text-gray-600 mb-4">
                {filters.search ||
                filters.status !== "all" ||
                filters.priority !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "Get started by creating your first task."}
                </p>
                <button onClick={handleCreateTask} className="btn btn-primary">
                Create Task
                </button>
            </div>
            </div>
        ) : (
            <div
            className={
                viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
            >
            {tasks.map((task) => (
                <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onUpdate={fetchTasks}
                onSelect={handleTaskSelect}
                isSelected={selectedTasks.has(task.id)}
                viewMode={viewMode}
                />
            ))}
            </div>
        )}

        {/* Task Modal */}
        {showModal && (
            <TaskModal
            task={selectedTask}
            onClose={() => {
                setShowModal(false);
                setSelectedTask(null);
            }}
            onSave={handleTaskUpdate}
            />
        )}
        </div>
  );
};

export default Dashboard;