'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import gsap from 'gsap';

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileTypeClass(type) {
    if (type?.startsWith('image')) return 'image';
    if (type?.includes('pdf')) return 'pdf';
    if (type?.startsWith('video')) return 'video';
    if (type?.includes('doc') || type?.includes('word') || type?.includes('text')) return 'document';
    return 'other';
}

function getFileIcon(type) {
    if (type?.startsWith('image')) return '🖼️';
    if (type?.includes('pdf')) return '📄';
    if (type?.startsWith('video')) return '🎬';
    if (type?.includes('zip') || type?.includes('rar')) return '📦';
    return '📎';
}

export default function UploadPage() {
    const [uploadQueue, setUploadQueue] = useState([]);
    const [toasts, setToasts] = useState([]);
    const zoneRef = useRef(null);

    useEffect(() => {
        if (zoneRef.current) {
            gsap.fromTo(zoneRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
            );
        }
    }, []);

    function addToast(message, type = 'info') {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }

    async function uploadFile(file, index) {
        try {
            setUploadQueue(prev => prev.map((item, i) =>
                i === index ? { ...item, status: 'uploading', progress: 20 } : item
            ));

            const formData = new FormData();
            formData.append('file', file);

            // Use XMLHttpRequest for progress tracking
            const result = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 90);
                        setUploadQueue(prev => prev.map((item, i) =>
                            i === index ? { ...item, progress: Math.max(20, percent) } : item
                        ));
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        try {
                            const err = JSON.parse(xhr.responseText);
                            reject(new Error(err.error || 'Upload failed'));
                        } catch {
                            reject(new Error('Upload failed'));
                        }
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Network error')));
                xhr.open('POST', '/api/upload');
                xhr.send(formData);
            });

            setUploadQueue(prev => prev.map((item, i) =>
                i === index ? { ...item, status: 'done', progress: 100, fileUrl: result.file?.fileUrl } : item
            ));

            addToast(`✅ ${file.name} uploaded successfully`, 'success');
        } catch (error) {
            console.error('Upload error:', error);
            setUploadQueue(prev => prev.map((item, i) =>
                i === index ? { ...item, status: 'error', progress: 0 } : item
            ));
            addToast(`❌ Failed to upload ${file.name}: ${error.message}`, 'error');
        }
    }

    const onDrop = useCallback((acceptedFiles) => {
        const newItems = acceptedFiles.map(file => ({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            progress: 0,
            // Create local preview for images
            preview: file.type?.startsWith('image') ? URL.createObjectURL(file) : null,
        }));

        const startIndex = uploadQueue.length;
        setUploadQueue(prev => [...prev, ...newItems]);

        // Upload each file
        newItems.forEach((item, i) => {
            uploadFile(item.file, startIndex + i);
        });
    }, [uploadQueue.length]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
    });

    return (
        <div>
            {/* Upload Zone */}
            <div ref={zoneRef}>
                <div
                    {...getRootProps()}
                    className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
                >
                    <input {...getInputProps()} />
                    <span className="upload-zone-icon">
                        {isDragActive ? '📥' : '☁️'}
                    </span>
                    <h3>
                        {isDragActive ? 'Drop your files here!' : 'Drag & drop files here'}
                    </h3>
                    <p>or click to browse from your computer</p>
                    <span className="browse-btn">Browse Files</span>
                    <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-tertiary)' }}>
                        Supports images, PDFs, documents, videos, and more
                    </p>
                </div>
            </div>

            {/* Upload Queue */}
            {uploadQueue.length > 0 && (
                <div className="upload-queue">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                            Uploads ({uploadQueue.filter(i => i.status === 'done').length}/{uploadQueue.length})
                        </h3>
                        {uploadQueue.every(i => i.status === 'done' || i.status === 'error') && (
                            <button
                                onClick={() => setUploadQueue([])}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                                    cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-family)'
                                }}
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {uploadQueue.map((item, index) => (
                        <div key={index} className="upload-item">
                            <div className={`upload-item-icon ${getFileTypeClass(item.type)}`}>
                                {item.preview ? (
                                    <img
                                        src={item.preview}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                    />
                                ) : (
                                    getFileIcon(item.type)
                                )}
                            </div>
                            <div className="upload-item-info">
                                <div className="upload-item-name">{item.name}</div>
                                <div className="upload-item-size">{formatBytes(item.size)}</div>
                                {item.status === 'uploading' && (
                                    <div className="upload-progress-bar">
                                        <div className="upload-progress-fill" style={{ width: `${item.progress}%` }} />
                                    </div>
                                )}
                            </div>
                            <div className="upload-item-status">
                                {item.status === 'pending' && '⏳'}
                                {item.status === 'uploading' && <span className="spinner" />}
                                {item.status === 'done' && '✅'}
                                {item.status === 'error' && '❌'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Toast Notifications */}
            {toasts.length > 0 && (
                <div className="toast-container">
                    {toasts.map(toast => (
                        <div key={toast.id} className={`toast ${toast.type}`}>
                            {toast.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
