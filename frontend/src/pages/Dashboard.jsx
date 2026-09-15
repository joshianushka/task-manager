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

const filteredTasks = tasks.filter((task) => {
  const matchesSearch =
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

  const matchesStatus =
    statusFilter === "all" ||
    task.status === statusFilter;

  return matchesSearch && matchesStatus;
});

const sortedTasks = [...filteredTasks].sort((a, b) => {
  if (sortOption === "newest") {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }

  if (sortOption === "oldest") {
    return new Date(a.createdAt) - new Date(b.createdAt);
  }

  const priorityOrder = {
    high: 3,
    medium: 2,
    low: 1,
  };

  if (sortOption === "priority") {
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  }

  return 0;
});

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

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

  const deleteTask=async(taskId)=>{
    const confirmed=window.confirm("Are you sure you want to delete this task?");
    if(!confirmed) return;
    try{
      await api.delete(`/tasks/${taskId}`);
      setTasks((prevTasks)=>prevTasks.filter((task)=>task._id!==taskId));
    }catch(error){
      setError(
        error.response?.data?.message || "Failed to delete task"
      );
    }
  };
  const handleEdit = (task) => {
  setEditingTask(task);
  setShowTaskForm(true);
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  
return (
  <div className="min-h-screen bg-gray-100">

    {/* ================= NAVBAR ================= */}
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-blue-600">
          Task Manager
        </h1>

        {/* User + Logout */}
        <div className="flex items-center gap-4">

          <span className="text-gray-600">
            Hi, {user?.name}
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg
                       hover:bg-red-600 transition"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>


    {/* ================= MAIN CONTENT ================= */}
    <main className="max-w-6xl mx-auto px-6 py-8">


      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* Total Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-medium text-gray-500">
            Total Tasks
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {totalTasks}
          </p>
        </div>


        {/* Todo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-medium text-gray-500">
            Todo
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {todoTasks}
          </p>
        </div>


        {/* In Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-medium text-gray-500">
            In Progress
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {inProgressTasks}
          </p>
        </div>


        {/* Completed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-medium text-gray-500">
            Completed
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {completedTasks}
          </p>
        </div>

      </div>


      {/* ================= TASK HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        {/* Heading */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            My Tasks
          </h2>

          <p className="text-gray-500 mt-1">
            Manage your tasks
          </p>
        </div>


        {/* Add Task Button */}
        <button
          onClick={() => {
            setEditingTask(null);
            setShowTaskForm(true);
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg
                     hover:bg-blue-700 transition duration-200
                     font-medium shadow-sm"
        >
          + Add Task
        </button>

      </div>


      {/* ================= TASK FORM / MODAL ================= */}
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
              ...prevTasks
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


      {/* ================= ERROR ================= */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}


      {/* ================= LOADING ================= */}
      {loading && (
        <p className="text-gray-500 mb-6">
          Loading tasks...
        </p>
      )}


      {/* ================= EMPTY STATE ================= */}
      {!loading && tasks.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">

          <h3 className="text-xl font-semibold text-gray-700">
            No tasks yet
          </h3>

          <p className="text-gray-500 mt-2">
            Create your first task to get started.
          </p>

          <button
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
            className="mt-5 bg-blue-600 text-white px-5 py-2.5
                       rounded-lg hover:bg-blue-700 transition"
          >
            + Create Task
          </button>

        </div>
      )}
<div className="flex flex-col md:flex-row gap-3 mb-6">

  <input
    type="text"
    placeholder="Search tasks..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="all">All Status</option>
    <option value="todo">Todo</option>
    <option value="in-progress">In Progress</option>
    <option value="completed">Completed</option>
  </select>

  <select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="priority">High Priority First</option>
  </select>

</div>


      {/* ================= TASK LIST ================= */}
      {!loading && filteredTasks.length > 0 && (
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sortedTasks.map((task) => (

            <div
              key={task._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >

              {/* Task Content */}
              <div className="flex flex-col md:flex-row
                              md:justify-between md:items-start gap-5">


                {/* LEFT SIDE */}
                <div className="flex-1">

                  <h3 className="text-xl font-semibold text-gray-800">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-gray-500 mt-2">
                      {task.description}
                    </p>
                  )}

                </div>


                {/* RIGHT SIDE */}
                <div className="flex flex-col gap-3 md:items-end">

                  {/* Status + Priority */}
                  <div className="flex flex-wrap gap-2 mt-4">

  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      task.status === "completed"
        ? "bg-green-100 text-green-700"
        : task.status === "in-progress"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {task.status}
  </span>

  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      task.priority === "high"
        ? "bg-red-100 text-red-700"
        : task.priority === "medium"
        ? "bg-orange-100 text-orange-700"
        : "bg-blue-100 text-blue-700"
    }`}
  >
    {task.priority}
  </span>

</div>


                  {/* Buttons */}
                  <div className="flex gap-2">

                    <button
                      onClick={() => handleEdit(task)}
                      className="bg-blue-600 text-white px-4 py-2
                                 rounded-lg hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteTask(task._id)}
                      className="bg-red-600 text-white px-4 py-2
                                 rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </main>

  </div>
);
}
export default Dashboard;
