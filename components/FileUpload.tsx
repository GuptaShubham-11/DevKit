import { upload } from '@imagekit/next';
import { ChangeEvent, useCallback, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

type FileType = 'image';
type UploadType = 'badge' | 'user';

interface AuthResponse {
  authenticationParameters: {
    signature: string;
    expire: number;
    token: string;
  };
}

interface UploadResponse {
  url: string;
  fileId: string;
  name: string;
  [key: string]: any;
}

interface FileUploadProps {
  onSuccess: (response: UploadResponse) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  fileType?: FileType;
  uploadType: UploadType;
  userId?: string;
  className?: string;
  maxFileSize?: number; // in MB
}

const DEFAULT_MAX_FILE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const UPLOAD_FOLDERS: Record<UploadType, (userId?: string) => string> = {
  badge: () => 'DevKit/Admin/Badges/',
  user: (userId) => (userId ? `DevKit/User/${userId}/` : 'DevKit/User/'),
};

//  Validates file type and size
const validateFile = (
  file: File,
  fileType?: FileType,
  maxSizeMb: number = DEFAULT_MAX_FILE_SIZE_MB
): { isValid: boolean; error?: string } => {
  if (fileType === 'image' && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Please upload a valid image file. Accepted formats: ${ACCEPTED_IMAGE_TYPES.join(', ')}`,
    };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMb}MB`,
    };
  }

  return { isValid: true };
};

const getUploadFolder = (type: UploadType, userId?: string): string => {
  const folderGetter = UPLOAD_FOLDERS[type];
  return folderGetter(userId);
};

const fetchAuthParameters = async (): Promise<AuthResponse> => {
  try {
    const response = await axios.get<AuthResponse>('/api/imagekit-auth');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(
      `Failed to get authentication: ${axiosError.message || 'Unknown error'}`
    );
  }
};

export const FileUpload = ({
  onSuccess,
  onProgress,
  onError,
  fileType = 'image',
  uploadType,
  userId,
  className,
  maxFileSize = DEFAULT_MAX_FILE_SIZE_MB,
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      setError(null);
      onError?.(null!);

      if (!file) return;

      // Validate file
      const validation = validateFile(file, fileType, maxFileSize);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        onError?.(validation.error || 'Invalid file');
        toast.error(validation.error || 'Invalid file');
        return;
      }

      if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
        const errorMsg = 'ImageKit public key not configured';
        setError(errorMsg);
        onError?.(errorMsg);
        toast.error(errorMsg);
        return;
      }

      setIsUploading(true);

      try {
        const auth = await fetchAuthParameters();
        const uploadFolder = getUploadFolder(uploadType, userId);

        const response = await upload({
          file,
          fileName: file.name,
          folder: uploadFolder,
          publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
          signature: auth.authenticationParameters.signature,
          expire: auth.authenticationParameters.expire,
          token: auth.authenticationParameters.token,
          onProgress: (event) => {
            if (event.lengthComputable && onProgress) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          },
        });

        onSuccess(response as UploadResponse);
        toast.success('File uploaded successfully');

        e.target.value = '';
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Upload failed. Please try again.';

        setError(errorMsg);
        onError?.(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsUploading(false);
      }
    },
    [fileType, maxFileSize, uploadType, userId, onSuccess, onProgress, onError]
  );

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      disabled={isUploading}
      className={className}
      aria-label="File upload"
    />
  );
};

export default FileUpload;
