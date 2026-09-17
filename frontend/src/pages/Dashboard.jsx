import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TaskForm from "../components/TaskForm";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // FETCH TASKS
  // =========================

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tasks");

      setTasks(response.data.tasks);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${taskId}`);

      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete task"
      );
    }
  };

  // =========================
  // EDIT TASK
  // =========================

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =========================
  // DEADLINE STATUS
  // =========================

  const getDeadlineStatus = (deadline, status) => {
    if (!deadline) return null;

    if (status === "completed") {
      return "completed";
    }

    const now = new Date();
    const deadlineDate = new Date(deadline);

    if (deadlineDate < now) {
      return "overdue";
    }

    const difference =
      deadlineDate.getTime() - now.getTime();

    const hoursLeft = difference / (1000 * 60 * 60);

    if (hoursLeft <= 24) {
      return "soon";
    }

    return "normal";
  };

  // =========================
  // STATISTICS
  // =========================

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // =========================
  // FILTER
  // =========================

  const filteredTasks = tasks.filter((task) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(search) ||
      (task.description || "")
        .toLowerCase()
        .includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================
  // SORT
  // =========================

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOption === "newest") {
      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    }

    if (sortOption === "oldest") {
      return (
        new Date(a.createdAt) -
        new Date(b.createdAt)
      );
    }

    if (sortOption === "deadline") {
      return (
        new Date(a.deadline) -
        new Date(b.deadline)
      );
    }

    const priorityOrder = {
      high: 3,
      medium: 2,
      low: 1,
    };

    if (sortOption === "priority") {
      return (
        priorityOrder[b.priority] -
        priorityOrder[a.priority]
      );
    }

    return 0;
  });

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-16 flex items-center justify-between">

            {/* Logo */}

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">
                  ✓
                </span>
              </div>

              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Task Manager
                </h1>

                <p className="text-[11px] text-gray-400 hidden sm:block">
                  Stay organized. Get things done.
                </p>
              </div>

            </div>

            {/* User */}

            <div className="flex items-center gap-4">

              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name}
                </p>

                <p className="text-xs text-gray-400">
                  Personal workspace
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium
                           text-gray-600
                           border border-gray-200
                           rounded-lg
                           hover:bg-gray-50
                           hover:text-gray-900
                           transition"
              >
                Logout
              </button>

            </div>

          </div>

        </div>

      </nav>


      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ================================================= */}
        {/* WELCOME */}
        {/* ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">

          <div>

            <p className="text-sm font-medium text-blue-600 mb-1">
              Welcome back 👋
            </p>

            <h2 className="text-3xl font-bold text-gray-900">
              Your productivity dashboard
            </h2>

            <p className="text-gray-500 mt-2">
              Track your tasks and keep your progress moving.
            </p>

          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
            className="self-start sm:self-auto
                       bg-blue-600
                       text-white
                       px-5 py-3
                       rounded-xl
                       font-medium
                       shadow-sm
                       hover:bg-blue-700
                       hover:shadow-md
                       transition"
          >
            + Add Task
          </button>

        </div>


        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total */}

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Tasks
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalTasks}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className="text-blue-600 text-lg">
                  ✓
                </span>
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-4">
              All your tasks
            </p>

          </div>


          {/* Todo */}

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  To Do
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {todoTasks}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600 text-lg">
                  ○
                </span>
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-4">
              Waiting to be started
            </p>

          </div>


          {/* In Progress */}

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  In Progress
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {inProgressTasks}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center">
                <span className="text-yellow-600 text-lg">
                  ◐
                </span>
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-4">
              Currently working on
            </p>

          </div>


          {/* Completed */}

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Completed
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {completedTasks}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <span className="text-green-600 text-lg">
                  ✓
                </span>
              </div>

            </div>

            <div className="flex items-center justify-between mt-4">

              <p className="text-xs text-gray-400">
                Overall completion
              </p>

              <p className="text-xs font-semibold text-green-600">
                {completionPercentage}%
              </p>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* PROGRESS BAR */}
        {/* ================================================= */}

        {totalTasks > 0 && (

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-8">

            <div className="flex justify-between items-center mb-3">

              <div>
                <h3 className="font-semibold text-gray-900">
                  Overall Progress
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </div>

              <span className="text-lg font-bold text-blue-600">
                {completionPercentage}%
              </span>

            </div>

            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />

            </div>

          </div>

        )}


        {/* ================================================= */}
        {/* TASK SECTION HEADER */}
        {/* ================================================= */}

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              My Tasks
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {filteredTasks.length} task
              {filteredTasks.length !== 1 ? "s" : ""} shown
            </p>
          </div>

        </div>


        {/* ================================================= */}
        {/* SEARCH + FILTERS */}
        {/* ================================================= */}

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">

          <div className="flex flex-col lg:flex-row gap-3">

            {/* Search */}

            <div className="relative flex-1">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full
                           pl-11 pr-4 py-3
                           bg-gray-50
                           border border-gray-200
                           rounded-xl
                           text-sm
                           focus:outline-none
                           focus:ring-2
                           focus:ring-blue-500
                           focus:bg-white
                           transition"
              />

            </div>


            {/* Status */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="px-4 py-3
                         bg-gray-50
                         border border-gray-200
                         rounded-xl
                         text-sm
                         text-gray-700
                         focus:outline-none
                         focus:ring-2
                         focus:ring-blue-500"
            >
              <option value="all">
                All Status
              </option>

              <option value="todo">
                To Do
              </option>

              <option value="in-progress">
                In Progress
              </option>

              <option value="completed">
                Completed
              </option>

            </select>


            {/* Sort */}

            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value)
              }
              className="px-4 py-3
                         bg-gray-50
                         border border-gray-200
                         rounded-xl
                         text-sm
                         text-gray-700
                         focus:outline-none
                         focus:ring-2
                         focus:ring-blue-500"
            >
              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="deadline">
                Due Date
              </option>

              <option value="priority">
                High Priority First
              </option>

            </select>

          </div>

        </div>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (

          <div className="bg-red-50
                          border border-red-200
                          text-red-700
                          px-4 py-3
                          rounded-xl
                          mb-6
                          flex items-center justify-between">

            <span className="text-sm">
              {error}
            </span>

            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>

          </div>

        )}


        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (

          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">

            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

            <p className="text-gray-500 text-sm">
              Loading your tasks...
            </p>

          </div>

        )}


        {/* ================================================= */}
        {/* EMPTY STATE */}
        {/* ================================================= */}

        {!loading &&
          tasks.length === 0 && (

            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">

              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">

                <span className="text-3xl">
                  ✓
                </span>

              </div>

              <h3 className="text-xl font-bold text-gray-900">
                No tasks yet
              </h3>

              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Start organizing your work by creating
                your first task.
              </p>

              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskForm(true);
                }}
                className="mt-6
                           bg-blue-600
                           text-white
                           px-5 py-2.5
                           rounded-xl
                           font-medium
                           hover:bg-blue-700
                           transition"
              >
                + Create Your First Task
              </button>

            </div>

          )}


        {/* ================================================= */}
        {/* NO SEARCH RESULTS */}
        {/* ================================================= */}

        {!loading &&
          tasks.length > 0 &&
          filteredTasks.length === 0 && (

            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">

              <div className="text-4xl mb-4">
                🔍
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No matching tasks
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Try changing your search or status filter.
              </p>

            </div>

          )}


        {/* ================================================= */}
        {/* TASK CARDS */}
        {/* ================================================= */}

        {!loading &&
          sortedTasks.length > 0 && (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {sortedTasks.map((task) => {

                const deadlineStatus =
                  getDeadlineStatus(
                    task.deadline,
                    task.status
                  );

                return (

                  <div
                    key={task._id}
                    className="bg-white
                               border border-gray-200
                               rounded-2xl
                               p-5
                               shadow-sm
                               hover:shadow-md
                               hover:-translate-y-0.5
                               transition-all
                               duration-200"
                  >

                    {/* ========================= */}
                    {/* TITLE */}
                    {/* ========================= */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex-1 min-w-0">

                        <h3 className="text-lg font-semibold text-gray-900 break-words">
                          {task.title}
                        </h3>

                        {task.description && (

                          <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                            {task.description}
                          </p>

                        )}

                      </div>

                    </div>


                    {/* ========================= */}
                    {/* BADGES */}
                    {/* ========================= */}

                    <div className="flex flex-wrap gap-2 mt-4">

                      {/* Status */}

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : task.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.status === "in-progress"
                          ? "In Progress"
                          : task.status === "todo"
                          ? "To Do"
                          : "Completed"}
                      </span>


                      {/* Priority */}

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "medium"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}{" "}
                        Priority
                      </span>

                    </div>


                    {/* ========================= */}
                    {/* DEADLINE */}
                    {/* ========================= */}

                    {task.deadline && (

                      <div
                        className={`mt-5
                                    p-3
                                    rounded-xl
                                    border
                                    ${
                                      deadlineStatus === "overdue"
                                        ? "bg-red-50 border-red-200"
                                        : deadlineStatus === "soon"
                                        ? "bg-orange-50 border-orange-200"
                                        : deadlineStatus === "completed"
                                        ? "bg-green-50 border-green-200"
                                        : "bg-gray-50 border-gray-200"
                                    }`}
                      >

                        <div className="flex items-center gap-2">

                          <span>
                            {deadlineStatus === "overdue"
                              ? "⚠️"
                              : deadlineStatus === "soon"
                              ? "⏰"
                              : deadlineStatus === "completed"
                              ? "✓"
                              : "📅"}
                          </span>

                          <div>

                            <p
                              className={`text-xs font-medium ${
                                deadlineStatus === "overdue"
                                  ? "text-red-600"
                                  : deadlineStatus === "soon"
                                  ? "text-orange-600"
                                  : deadlineStatus === "completed"
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {deadlineStatus === "overdue"
                                ? "Overdue"
                                : deadlineStatus === "soon"
                                ? "Due Soon"
                                : deadlineStatus === "completed"
                                ? "Completed Before Deadline"
                                : "Deadline"}
                            </p>

                            <p className="text-sm font-semibold text-gray-800 mt-0.5">
                              {formatDate(task.deadline)}
                            </p>

                          </div>

                        </div>

                      </div>

                    )}


                    {/* ========================= */}
                    {/* CREATED */}
                    {/* ========================= */}

                    <p className="text-xs text-gray-400 mt-4">
                      Created {formatDate(task.createdAt)}
                    </p>


                    {/* ========================= */}
                    {/* ACTIONS */}
                    {/* ========================= */}

                    <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">

                      <button
                        onClick={() => handleEdit(task)}
                        className="flex-1
                                   px-4 py-2
                                   rounded-lg
                                   text-sm
                                   font-medium
                                   text-blue-600
                                   bg-blue-50
                                   hover:bg-blue-100
                                   transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteTask(task._id)
                        }
                        className="flex-1
                                   px-4 py-2
                                   rounded-lg
                                   text-sm
                                   font-medium
                                   text-red-600
                                   bg-red-50
                                   hover:bg-red-100
                                   transition"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                );

              })}

            </div>

          )}

      </main>


      {/* ================================================= */}
      {/* TASK FORM */}
      {/* ================================================= */}

      {showTaskForm && (

        <TaskForm

          task={editingTask}

          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}

          onTaskCreated={(newTask) => {

            setTasks((prevTasks) => [
              newTask,
              ...prevTasks,
            ]);

            setShowTaskForm(false);

          }}

          onTaskUpdated={(updatedTask) => {

            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task._id === updatedTask._id
                  ? updatedTask
                  : task
              )
            );

            setShowTaskForm(false);
            setEditingTask(null);

          }}

        />

      )}

    </div>
  );
}

export default Dashboard;