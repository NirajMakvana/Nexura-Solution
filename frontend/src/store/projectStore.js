import { create } from 'zustand';
import { adminService } from '../services/adminService';

const useProjectStore = create((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,

    fetchProjects: async () => {
        try {
            set({ isLoading: true, error: null });
            const projects = await adminService.getProjects();
            set({ projects, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addProject: async (projectData) => {
        try {
            set({ isLoading: true, error: null });
            const newProject = await adminService.createProject(projectData);
            set((state) => ({ projects: [...state.projects, newProject], isLoading: false }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateProject: async (id, projectData) => {
        try {
            set({ isLoading: true, error: null });
            const updatedProject = await adminService.updateProject(id, projectData);
            set((state) => ({
                projects: state.projects.map((p) => (p._id === id ? updatedProject : p)),
                isLoading: false
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteProject: async (id) => {
        try {
            set({ isLoading: true, error: null });
            await adminService.deleteProject(id);
            set((state) => ({
                projects: state.projects.filter((p) => p._id !== id),
                isLoading: false
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));

export default useProjectStore;
