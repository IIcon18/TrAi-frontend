import apiClient from './apiClient';

export interface Attachment {
  id: number;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
}

export const uploadAttachment = async (
  file: File,
  entityType: string,
  entityId: number,
): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entity_type', entityType);
  formData.append('entity_id', String(entityId));
  const res = await apiClient.post<Attachment>('/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const listAttachments = async (entityType: string, entityId: number): Promise<Attachment[]> => {
  const res = await apiClient.get<Attachment[]>(`/attachments/entity/${entityType}/${entityId}`);
  return res.data;
};

export const getAttachmentUrl = async (id: number): Promise<string> => {
  const res = await apiClient.get<{ url: string }>(`/attachments/${id}/url`);
  return res.data.url;
};

export const deleteAttachment = async (id: number): Promise<void> => {
  await apiClient.delete(`/attachments/${id}`);
};
