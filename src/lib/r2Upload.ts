import { supabase } from '@/integrations/supabase/client';

interface UploadToR2Options {
  file: File | Blob;
  folder: string;
  fileName?: string;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload a file to Cloudflare R2 via the upload-media edge function.
 */
export async function uploadToR2({
  file,
  folder,
  fileName,
  onProgress,
}: UploadToR2Options): Promise<UploadResult> {
  try {
    // Simulate initial progress
    onProgress?.(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    if (fileName) {
      formData.append('fileName', fileName);
    }

    onProgress?.(30);

    const { data, error } = await supabase.functions.invoke('upload-media', {
      body: formData,
    });

    onProgress?.(90);

    if (error) {
      console.error('R2 upload error:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Upload failed' };
    }

    onProgress?.(100);

    return {
      success: true,
      url: data.url,
      key: data.key,
    };
  } catch (err: any) {
    console.error('R2 upload exception:', err);
    return { success: false, error: err.message || 'Upload failed' };
  }
}
