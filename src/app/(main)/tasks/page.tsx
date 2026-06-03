'use client';

import { useTasks, priorityLabel } from './useTasks'; 

export default function TodosPage() {
  const {
    todos, userName, loading,
    taskTitle, setTaskTitle,
    taskDescription, setTaskDescription,
    taskPriority, setTaskPriority,
    deadline, setDeadline,
    status, setStatus,
    editingTaskId,
    addTasks, toggleTask, deleteTask, handleLogout, startEditTask, cancelEditTask
  } = useTasks();

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="shadow-md p-6">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
            {userName && <p className="text-sm text-gray-500">Halo, {userName}!</p>}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-lg border">
          <input
            id="task-title"
            type="text"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Judul tugas..."
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <textarea
            id="task-description"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
            placeholder="Deskripsi (opsional)..."
            rows={2}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label htmlFor="task-priority" className="text-xs text-gray-600 font-medium mb-1">Prioritas</label>
              <select
                id="task-priority"
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                value={taskPriority}
                onChange={(e) => setTaskPriority(Number(e.target.value))}
              >
                <option value={1}>1 — Rendah</option>
                <option value={2}>2 — Sedang</option>
                <option value={3}>3 — Tinggi</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="task-status" className="text-xs text-gray-600 font-medium mb-1">Status</label>
              <select
                id="task-status"
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="task-deadline" className="text-xs text-gray-600 font-medium mb-1">Tenggat Waktu (Deadline)</label>
            <div className="flex gap-3">
              <input
                id="task-deadline"
                type="datetime-local"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                title="Tenggat waktu tugas"
              />
              <button
                onClick={addTasks}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
              >
                {editingTaskId ? 'Simpan Perubahan' : 'Tambah'}
              </button>
            </div>
          </div>

          {editingTaskId && (
            <button
              onClick={cancelEditTask}
              className="self-start text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Batal edit
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 text-sm">Memuat tugas...</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo.id} className={`p-3 rounded-lg border transition-all ${todo.is_completed ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.is_completed || false}
                      onChange={() => toggleTask(todo.id, todo.is_completed || false)}
                      aria-label={`Tandai tugas ${todo.title} sebagai selesai`}
                      className="w-5 h-5 cursor-pointer mt-0.5 shrink-0"
                    />
                    <div className="flex flex-col gap-1 w-full">
                      <span className={`font-medium text-black ${todo.is_completed ? 'line-through text-gray-400' : ''}`}>
                        {todo.title}
                      </span>
                      
                      {todo.description && (
                        <span className={`text-sm ${todo.is_completed ? 'text-gray-400' : 'text-gray-500'}`}>
                          {todo.description}
                        </span>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 ${priorityLabel[todo.priority]?.color ?? 'text-gray-400'}`}>
                          Prioritas: {priorityLabel[todo.priority]?.text ?? '-'}
                        </span>
                        
                        {todo.status && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                            Status: {todo.status.replace('_', ' ')}
                          </span>
                        )}

                        {todo.deadline && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${new Date(todo.deadline) < new Date() && !todo.is_completed ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                            📅 {new Date(todo.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(todo.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm shrink-0 p-1"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => startEditTask(todo)}
                    className="text-blue-500 hover:text-blue-700 font-medium text-sm shrink-0 p-1"
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && todos.length === 0 && (
          <p className="text-center text-gray-500 mt-4 text-sm">Belum ada tugas. Bersantai sejenak!</p>
        )}
      </div>
    </main>
  );
}