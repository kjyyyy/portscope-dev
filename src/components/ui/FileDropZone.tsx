// components/FileDropZone.tsx
'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';

type FileDropZoneProps = {
  onFilesAccepted: (files: File[]) => void;
};

export default function FileDropZone({ onFilesAccepted }: FileDropZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAccepted(acceptedFiles);
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  return (
    <Card className="border-dashed border-2 border-gray-300 p-6 text-center">
      <CardContent {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag and drop some files here, or click to select files</p>
        )}
      </CardContent>
    </Card>
  );
}
