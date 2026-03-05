// src/components/ProgressPhotos.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Attachment,
  deleteAttachment,
  getAttachmentUrl,
  listAttachments,
  uploadAttachment,
} from '../api/attachmentsApi';
import './ProgressPhotos.css';

// Photos are attached to the user entity (entity_type="user", entity_id=user.id)
// We get the user id from the JWT stored by the apiClient — on the backend the
// endpoint filters by current_user.id, so we can pass 0 as a placeholder and
// the backend will still return only the current user's photos.
// Better: decode the id from localStorage token.
const getUserId = (): number => {
  try {
    const token = localStorage.getItem('access_token') || '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub as number;
  } catch {
    return 0;
  }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

const ProgressPhotos: React.FC = () => {
  const userId = getUserId();
  const [photos, setPhotos] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    try {
      const data = await listAttachments('user', userId);
      setPhotos(data);
    } catch (err: any) {
      console.error('Failed to load photos', err);
    }
  };

  useEffect(() => {
    if (userId) fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Допустимы только JPEG, PNG, GIF и PDF файлы.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('Размер файла не должен превышать 10 МБ.');
      return;
    }

    setUploading(true);
    try {
      await uploadAttachment(file, 'user', userId);
      await fetchPhotos();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Ошибка загрузки. Попробуйте снова.');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (photo: Attachment) => {
    setLoadingId(photo.id);
    try {
      const url = await getAttachmentUrl(photo.id);
      window.open(url, '_blank');
    } catch (err: any) {
      alert('Не удалось получить ссылку для скачивания.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить это фото?')) return;
    try {
      await deleteAttachment(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Не удалось удалить фото.');
    }
  };

  const isImage = (ct: string) => ct.startsWith('image/');
  const formatSize = (bytes: number) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="pp-card">
      <h3 className="pp-title">Фото прогресса</h3>

      <div className="pp-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="pp-item">
            {isImage(photo.content_type) ? (
              <div className="pp-thumb-wrapper" onClick={() => handleView(photo)}>
                {loadingId === photo.id ? (
                  <div className="pp-spinner">⏳</div>
                ) : (
                  <div className="pp-thumb-placeholder">🖼</div>
                )}
              </div>
            ) : (
              <div className="pp-thumb-wrapper pp-pdf" onClick={() => handleView(photo)}>
                <span className="pp-pdf-icon">📄</span>
              </div>
            )}
            <div className="pp-item-info">
              <span className="pp-filename" title={photo.filename}>
                {photo.filename.length > 16 ? photo.filename.slice(0, 14) + '…' : photo.filename}
              </span>
              <span className="pp-size">{formatSize(photo.size)}</span>
            </div>
            <button
              className="pp-delete-btn"
              onClick={() => handleDelete(photo.id)}
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}

        {/* Upload cell */}
        <div
          className={`pp-item pp-upload-cell ${uploading ? 'pp-uploading' : ''}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
          title="Add photo or PDF"
        >
          {uploading ? (
            <div className="pp-spinner">⏳</div>
          ) : (
            <span className="pp-plus">+</span>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {photos.length === 0 && !uploading && (
        <p className="pp-hint">Нажмите + чтобы добавить первое фото прогресса</p>
      )}
    </div>
  );
};

export default ProgressPhotos;
