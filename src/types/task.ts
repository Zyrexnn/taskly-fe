import type { Task } from "../services/api";
import http from "../utils/http";

export interface ListTaskResponse {
    success: boolean;
    data: Task[];
    message: string;
}

export const fetchTasks = async (): Promise<Task[]> => {
    const { data } = await http.get<ListTaskResponse>('/tasks');
    return data.data;
};

export interface DeleteTaskResponse {
    success: boolean;
    data: Task;
    message: string;
}

export const deleteTask = async (id: number): Promise<boolean> => {
    const { data } = await http.delete<DeleteTaskResponse>(`/tasks/${id}`);
    return data.success;
};
