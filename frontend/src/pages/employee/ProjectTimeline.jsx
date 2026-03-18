import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    FolderOpen,
    Target,
    TrendingUp,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import EmployeeLayout from '../../components/employee/EmployeeLayout';
import { employeeService } from '../../services/employeeService';
import { toast } from 'react-hot-toast';

const ProjectTimeline = () => {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [projectsData, tasksData] = await Promise.all([
                employeeService.getMyProjects().catch(() => []),
                employeeService.getMyTasks().catch(() => [])
            ]);
            setProjects(projectsData || []);
            setTasks(tasksData || []);
        } catch (error) {
            console.error('Error loading timeline data:', error);
            toast.error('Failed to load project details');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = selectedProjectId === 'all'
        ? projects
        : projects.filter(p => p._id === selectedProjectId);

    const getProjectTasks = (projectId) => {
        return tasks.filter(t => {
            const taskId = t.project?._id || t.project;
            return taskId === projectId;
        });
    };

    const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'completed' || s === 'done') return 'bg-green-100 text-green-700';
        if (s === 'in progress' || s === 'in-progress') return 'bg-blue-100 text-blue-700';
        if (s === 'overdue') return 'bg-red-100 text-red-700';
        return 'bg-amber-100 text-amber-700';
    };

    return (
        <EmployeeLayout>
            <div className="p-1 md:p-6 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Project <span className="text-green-600">Timelines</span>
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium italic">Track your assigned projects and upcoming milestones</p>
                    </div>
                </div>

                {/* Filter & Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none appearance-none bg-white font-medium"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                                <option value="all">Detailed View: All Projects</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={loadData}
                            className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        >
                            <TrendingUp className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-black text-green-600">{projects.length}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Projects</p>
                        </div>
                        <div className="w-px h-10 bg-gray-100"></div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-green-600">
                                {tasks.filter(t => t.status === 'Completed').length}
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Tasks Done</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
                        <p className="mt-4 text-gray-500 font-medium tracking-tight">Loading your timeline data...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center text-gray-500 min-h-[400px] flex flex-col justify-center items-center">
                        <FolderOpen className="w-20 h-20 text-gray-200 mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Projects</h3>
                        <p className="max-w-xs mx-auto leading-relaxed font-medium">You aren't associated with any active projects yet. Check back once you're assigned.</p>
                    </div>
                ) : (
                    <div className="space-y-12 pb-12">
                        {filteredProjects.map((project) => (
                            <div key={project._id} className="relative">
                                {/* Project Header Card */}
                                <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden group">
                                    <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
                                    <div className="p-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                                        <FolderOpen className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-bold text-green-600 uppercase tracking-widest">{project.category || 'Development'}</span>
                                                </div>
                                                <h2 className="text-3xl font-black text-gray-900 group-hover:text-green-600 transition-colors uppercase tracking-tight">{project.name}</h2>
                                                <div className="flex items-center gap-4 text-gray-400 text-sm font-medium">
                                                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Ends {new Date(project.endDate).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> {project.progress || 0}% Complete</span>
                                                </div>
                                            </div>
                                            <div className={`px-6 py-2 rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm border ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden mb-12 shadow-inner border border-gray-50">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                                                style={{ width: `${project.progress || 10}%` }}
                                            ></div>
                                        </div>

                                        {/* Task Milestones in Timeline Format */}
                                        <div className="space-y-10 relative">
                                            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                                            {getProjectTasks(project._id).length > 0 ? (
                                                getProjectTasks(project._id).map((task, idx) => (
                                                    <div key={task._id} className="relative pl-12 group/task">
                                                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 transition-all duration-300 ${task.status === 'Completed' ? 'bg-green-500 text-white scale-110' : 'bg-gray-100 text-gray-400 group-hover/task:bg-green-100 group-hover/task:text-green-500'
                                                            }`}>
                                                            {task.status === 'Completed' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                        </div>
                                                        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:bg-white hover:border-green-100 hover:shadow-xl transition-all group-hover/task:-translate-y-1">
                                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                                <h4 className="font-bold text-gray-900 group-hover/task:text-green-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{task.priority} Priority</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 leading-relaxed mb-4">{task.description}</p>
                                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                                <div className="flex items-center gap-2 text-gray-400">
                                                                    <Calendar className="w-3 h-3" />
                                                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                                                </div>
                                                                <div className={task.status === 'Completed' ? 'text-green-600' : 'text-amber-500'}>
                                                                    {task.status}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                                    No specific milestones defined for this project yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </EmployeeLayout>
    );
};

export default ProjectTimeline;
