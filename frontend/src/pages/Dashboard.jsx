import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-2xl font-bold text-blue-600">
            Task Manager
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Hi, {user?.name}
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

        </div>
      </nav>


      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex justify-between items-center mb-6">

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              My Tasks
            </h2>

            <p className="text-gray-500 mt-1">
              Manage your tasks
            </p>
          </div>

          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Task
          </button>

        </div>


        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}


        {/* Loading */}
        {loading && (
          <p className="text-gray-500">
            Loading tasks...
          </p>
        )}


        {/* Empty state */}
        {!loading && tasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              No tasks yet
            </h3>

            <p className="text-gray-500 mt-2">
              Create your first task to get started.
            </p>
          </div>
        )}


        {/* Tasks */}
        {!loading && tasks.length > 0 && (
          <div className="grid gap-4">

            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-xl shadow-sm p-6"
              >

                <div className="flex justify-between items-start">

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {task.title}
                    </h3>

                    <p className="text-gray-500 mt-2">
                      {task.description}
                    </p>
                  </div>


                  <div className="flex gap-2">

                    <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                      {task.status}
                    </span>

                    <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-700">
                      {task.priority}
                    </span>

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