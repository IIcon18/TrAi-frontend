import React, { useEffect, useRef, useState } from 'react';
import {
  Attachment,
  deleteAttachment,
  getAttachmentUrl,
  listAttachments,
  uploadAttachment,
} from '../api/attachmentsApi';
import './ProgressPhotos.css';

const PhotoThumb: React.FC<{ photo: Attachment; onClick: () => void }> = ({ photo, onClick }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [thumbLoading, setThumbLoading] = useState(true);

  useEffect(() => {
    if (!photo.content_type.startsWith('image/')) {
      setThumbLoading(false);
      return;
    }
    getAttachmentUrl(photo.id)
      .then(url => setSrc(url))
      .catch(() => {})
      .finally(() => setThumbLoading(false));
  }, [photo.id, photo.content_type]);

  if (!photo.content_type.startsWith('image/')) {
    return (
      <div className="pp-thumb-wrapper pp-pdf" onClick={onClick}>
        <span className="pp-pdf-icon">📄</span>
      </div>
    );
  }

  return (
    <div className="pp-thumb-wrapper" onClick={onClick}>
      {thumbLoading ? (
        <div className="pp-spinner">⏳</div>
      ) : src ? (
        <img src={src} alt={photo.filename} className="pp-thumb-img" />
      ) : (
        <span className="pp-thumb-placeholder">🖼</span>
      )}
    </div>
  );
};

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

  const formatSize = (bytes: number) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="pp-card">
      <h3 className="pp-title">Фото прогресса</h3>

      <div className="pp-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="pp-item">
            {loadingId === photo.id ? (
              <div className="pp-thumb-wrapper" onClick={() => handleView(photo)}>
                <div className="pp-spinner">⏳</div>
              </div>
            ) : (
              <PhotoThumb photo={photo} onClick={() => handleView(photo)} />
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
