import React, { useState, useRef } from "react";
import {
  Paperclip,
  Download,
  Trash2,
  File,
  Image,
  Video,
  Upload,
  X,
  FileText,
  Archive,
  Loader,
} from "lucide-react";
import { attachmentsAPI } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

const TaskAttachments = ({
  taskId,
  attachments: initialAttachments,
  onUpdate,
}) => {
  const [attachments, setAttachments] = useState(initialAttachments || []);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const fileInputRef = useRef(null);
  const toast = useToast();

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // File Upload Logic dengan Progress
  const handleFiles = async (files) => {
    const validFiles = files.filter((file) => isValidFile(file));

    if (validFiles.length === 0) {
      toast.error(
        "No valid files selected. Supported formats: images, videos, PDF, DOC, TXT, ZIP (Max: 10MB)"
      );
      return;
    }

    if (validFiles.length < files.length) {
      toast.warning(
        `Some files were skipped. Only supported formats are allowed.`
      );
    }

    for (const file of validFiles) {
      await uploadFileWithProgress(file);
    }
  };

  const uploadFileWithProgress = async (file) => {
    setUploading(true);

    // Setup progress tracking
    setUploadProgress((prev) => ({
      ...prev,
      [file.name]: 0,
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Create custom axios instance for progress tracking
      const response = await attachmentsAPI.upload(taskId, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: percentCompleted,
          }));
        },
      });

      // Add new attachment to list
      setAttachments((prev) => [...prev, response.data.attachment]);

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }, 1000);

      onUpdate();
      toast.success(`"${file.name}" uploaded successfully`);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage =
        error.response?.data?.message || `Failed to upload "${file.name}"`;
      toast.error(errorMessage);

      // Remove failed upload from progress
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
    } finally {
      setUploading(false);
    }
  };

  const isValidFile = (file) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/webm",
      "video/x-msvideo",
      "application/zip",
      "application/x-rar-compressed",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await attachmentsAPI.download(attachment.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`"${attachment.file_name}" download started`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (attachmentId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(attachmentId));

    try {
      await attachmentsAPI.delete(attachmentId);
      setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
      onUpdate();
      toast.success(`"${fileName}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("Failed to delete attachment");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(attachmentId);
        return newSet;
      });
    }
  };

  const getFileIcon = (mimeType, fileName) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    if (mimeType.startsWith("video/")) {
      return <Video className="h-8 w-8 text-purple-500" />;
    }
    if (mimeType === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (mimeType.includes("word") || mimeType.includes("document")) {
      return <FileText className="h-8 w-8 text-blue-600" />;
    }
    if (mimeType.includes("zip") || mimeType.includes("rar")) {
      return <Archive className="h-8 w-8 text-yellow-600" />;
    }
    if (mimeType === "text/plain") {
      return <FileText className="h-8 w-8 text-gray-600" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getFilePreview = (attachment) => {
    if (
      attachment.mime_type.startsWith("image/") &&
      attachment.thumbnail_path
    ) {
      return (
        <img
          src={`http://localhost:8000/storage/${attachment.thumbnail_path}`}
          alt={attachment.file_name}
          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      );
    }
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getUploadingFilesCount = () => {
    return Object.keys(uploadProgress).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Paperclip className="h-6 w-6 text-gray-600" />
          <div>
            <h4 className="font-semibold text-gray-900">Attachments</h4>
            <p className="text-sm text-gray-500">
              {attachments.length} file{attachments.length !== 1 ? "s" : ""}
              {getUploadingFilesCount() > 0 &&
                `, ${getUploadingFilesCount()} uploading`}
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <label
          className={`btn btn-primary flex items-center space-x-2 cursor-pointer ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Add Files</span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInput}
            disabled={uploading}
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          />
        </label>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-400 bg-blue-50 scale-[1.02] shadow-sm"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        } ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <Upload
          className={`h-12 w-12 mx-auto mb-4 ${
            isDragging ? "text-blue-500" : "text-gray-400"
          }`}
        />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragging ? "Drop files to upload" : "Drag & drop files here"}
        </p>
        <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
        <p className="text-xs text-gray-400">
          Supports images, videos, PDF, DOC, TXT, ZIP (Max: 10MB per file)
        </p>
      </div>

      {/* Upload Progress */}
      {getUploadingFilesCount() > 0 && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-700 text-sm">
            Uploading {getUploadingFilesCount()} file
            {getUploadingFilesCount() !== 1 ? "s" : ""}...
          </h5>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div
              key={fileName}
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <File className="h-5 w-5 text-blue-500" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium truncate text-blue-900">
                    {fileName}
                  </span>
                  <span className="text-blue-700 font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attachments List */}
      {attachments.length === 0 && getUploadingFilesCount() === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <Paperclip className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No attachments yet</p>
          <p className="text-sm">
            Drag & drop files or click the button above to upload
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {attachments.map((attachment) => {
            const isDeleting = deletingIds.has(attachment.id);
            return (
              <div
                key={attachment.id}
                className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all ${
                  isDeleting ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {getFilePreview(attachment) ||
                      getFileIcon(attachment.mime_type, attachment.file_name)}
                  </div>

                  {/* File Info */}
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    {/* File Name */}
                    <p className="font-medium text-sm truncate text-gray-900 mb-1">
                      {attachment.file_name}
                    </p>

                    {/* Detail Info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>{formatFileSize(attachment.file_size)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{attachment.mime_type}</span>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">Uploaded by</span>
                        <span className="font-medium text-gray-700">
                          {attachment.uploader?.name || "Unknown"}
                        </span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span className="whitespace-nowrap">
                        {new Date(attachment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(attachment)}
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(attachment.id, attachment.file_name)
                    }
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {isDeleting ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Uploading State */}
      {uploading && getUploadingFilesCount() === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Preparing upload...</span>
        </div>
      )}
    </div>
  );
};

export default TaskAttachments;
