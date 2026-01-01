import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, Loader2, Image } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToR2 } from '@/lib/r2Upload';

interface WritingImageUploaderProps {
  taskId: string;
  currentImageUrl: string | null;
  currentImageWidth: number | null;
  currentImageHeight: number | null;
  onUploadSuccess: (url: string, width: number | null, height: number | null) => void;
  onRemoveSuccess: () => void;
}

export function WritingImageUploader({
  taskId,
  currentImageUrl,
  currentImageWidth,
  currentImageHeight,
  onUploadSuccess,
  onRemoveSuccess,
}: WritingImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please upload an image file.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file || !taskId) {
      toast.error('No file selected or task ID missing.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadToR2({
        file,
        folder: `writing-images/${taskId}`,
        onProgress: setProgress,
      });

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      // Get image dimensions
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      onUploadSuccess(result.url, img.width, img.height);
      toast.success('Image uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveImage = () => {
    if (!currentImageUrl) return;
    if (!confirm('Are you sure you want to remove this image?')) return;
    // R2 doesn't require deletion for overwrite - just clear the reference
    onRemoveSuccess();
    toast.success('Image removed successfully!');
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">Upload Image File (JPG, PNG, GIF, etc.)</Label>
      {currentImageUrl ? (
        <div className="flex flex-col gap-3 p-3 border rounded-md bg-muted/30">
          <div className="flex items-center gap-3">
            <Image size={20} className="text-primary" />
            <span className="flex-1 text-sm truncate">
              {currentImageUrl.split('/').pop()}
            </span>
            <Button variant="destructive" size="sm" onClick={handleRemoveImage}>
              Remove
            </Button>
          </div>
          <img 
            src={currentImageUrl} 
            alt="Uploaded image preview" 
            className="max-w-full h-auto rounded-md border" 
            style={{ 
              width: currentImageWidth ? `${currentImageWidth}px` : 'auto', 
              height: currentImageHeight ? `${currentImageHeight}px` : 'auto',
              objectFit: 'contain'
            }}
          />
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>Original Dimensions: {currentImageWidth || 'N/A'}x{currentImageHeight || 'N/A'}px</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={uploading}
          />
          {file && (
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Uploading ({progress}%)
                </>
              ) : (
                <>
                  <UploadCloud size={18} className="mr-2" />
                  Upload Image
                </>
              )}
            </Button>
          )}
          {uploading && <Progress value={progress} className="w-full" />}
        </div>
      )}
    </div>
  );
}
