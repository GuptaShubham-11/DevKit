import { useState, useCallback } from 'react';
import { CheckCircle, Upload, X } from 'lucide-react';

import Loader from './Loader';
import { Button } from './ui/button';
import FileUpload from './FileUpload';
import { Progress } from './ui/progress';

interface UploadResponse {
  url: string;
  [key: string]: unknown;
}

interface UploadAreaProps {
  isUploading: boolean;
  imagePreview: string;
  uploadProgress: number;
  onFileUpload: (file: UploadResponse | null) => void;
  setImagePreview: (preview: string) => void;
  maxFileSize?: number;
  acceptedFormats?: string[];
}

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ACCEPTED_FORMATS = ['PNG', 'JPG'];

export const UploadArea: React.FC<UploadAreaProps> = ({
  isUploading,
  onFileUpload,
  imagePreview,
  uploadProgress,
  setImagePreview,
  maxFileSize = DEFAULT_MAX_SIZE_MB,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement | null;

    if (fileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      fileInput.files = dataTransfer.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  const handleClearPreview = useCallback(() => {
    setImagePreview('');
    onFileUpload(null);
  }, [setImagePreview, onFileUpload]);

  const hasPreview = Boolean(imagePreview);
  const formatsList = acceptedFormats.join(', ');

  return (
    <div className="space-y-2">
      <div
        className={`
          relative rounded-[2px] border border-dashed p-6
          bg-surface-secondary/30 text-text-primary outline-none
          transition-all duration-200
          ${
            dragActive
              ? 'border-accent-success bg-accent-success/5'
              : 'border-border-color hover:border-white/20'
          }
          ${hasPreview ? 'bg-surface-primary' : 'bg-surface-secondary/30'}
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="presentation"
      >
        {hasPreview ? (
          <PreviewContent
            imagePreview={imagePreview}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onClear={handleClearPreview}
          />
        ) : (
          <EmptyContent
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            maxFileSize={maxFileSize}
            formatsList={formatsList}
          />
        )}

        <FileUpload
          onSuccess={(res: UploadResponse) => {
            setImagePreview(res.url);
            onFileUpload(res);
          }}
          uploadType="badge"
          onProgress={() => {
            // Progress handled by parent component via uploadProgress prop
          }}
          fileType="image"
          className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

interface PreviewContentProps {
  imagePreview: string;
  isUploading: boolean;
  uploadProgress: number;
  onClear: () => void;
}

const PreviewContent: React.FC<PreviewContentProps> = ({
  imagePreview,
  isUploading,
  uploadProgress,
  onClear,
}) => (
  <div className="space-y-2">
    <div className="relative inline-block left-[40%]">
      <img
        src={imagePreview}
        alt="Badge preview"
        className={`size-18 md:size-20 rounded-xl object-cover shadow-lg`}
      />

      {!isUploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          aria-label="Remove image"
          className="absolute -top-2 -right-2 size-6 rounded-full border-0 p-0 bg-accent-error text-text-primary hover:bg-red-600 hover:text-accent-error/10"
        >
          <X className="size-3" />
        </Button>
      )}
    </div>

    {isUploading ? (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {uploadProgress}% Uploading...
          </span>
        </div>
        <div className="mx-auto w-full max-w-xs">
          <Progress
            value={uploadProgress}
            className="bg-surface-secondary data-[progress-indicator]:bg-accent-error"
            aria-label="Upload progress"
          />
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center gap-2 text-accent-success">
        <CheckCircle className="size-5" />
        <span className="text-sm font-medium">Upload complete!</span>
      </div>
    )}
  </div>
);

interface EmptyContentProps {
  isUploading: boolean;
  uploadProgress: number;
  maxFileSize: number;
  formatsList: string;
}

const EmptyContent: React.FC<EmptyContentProps> = ({
  isUploading,
  uploadProgress,
  maxFileSize,
  formatsList,
}) => (
  <div className="space-y-3 text-center">
    <div
      className={`size-12 md:size-18 mx-auto flex items-center justify-center rounded-full bg-surface-primary`}
    >
      {isUploading ? (
        <Loader />
      ) : (
        <Upload className={`size-6 md:size-8 text-text-primary`} />
      )}
    </div>

    <div className="space-y-1">
      <p className="mb-1 font-semibold text-text-secondary">
        {isUploading
          ? `Uploading... ${uploadProgress}%`
          : 'Drop your badge image here'}
      </p>

      {!isUploading && (
        <>
          <p className="text-sm text-text-secondary md:text-sm">
            or click to browse files
          </p>
          <p className="text-xs text-text-muted">
            {formatsList} up to {maxFileSize}MB
          </p>
        </>
      )}
    </div>

    {isUploading && (
      <div className="mx-auto w-full max-w-xs">
        <Progress
          value={uploadProgress}
          className="bg-surface-secondary"
          aria-label="Upload progress"
        />
      </div>
    )}
  </div>
);
