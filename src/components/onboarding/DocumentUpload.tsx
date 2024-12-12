import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Check, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  onSubmit: (licenseFile: File, backgroundCheckFile: File) => Promise<void>;
  driverLicenseUrl?: string;
  backgroundCheckUrl?: string;
}

export function DocumentUpload({ 
  onSubmit,
  driverLicenseUrl,
  backgroundCheckUrl
}: DocumentUploadProps) {
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseFile || !backgroundFile) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(licenseFile, backgroundFile);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onLicenseDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLicenseFile(acceptedFiles[0]);
    }
  }, []);

  const onBackgroundDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setBackgroundFile(acceptedFiles[0]);
    }
  }, []);

  const licenseDropzone = useDropzone({
    onDrop: onLicenseDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxFiles: 1
  });

  const backgroundDropzone = useDropzone({
    onDrop: onBackgroundDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Driver License
            </label>
            <div
              {...licenseDropzone.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${licenseDropzone.isDragActive ? 'border-[#F5A623] bg-[#F5A623]/10' : 'border-neutral-700 hover:border-[#F5A623]'}
              `}
            >
              <input {...licenseDropzone.getInputProps()} />
              <div className="flex flex-col items-center space-y-2">
                {licenseFile ? (
                  <>
                    <Check className="w-8 h-8 text-green-500" />
                    <p className="text-green-500">License uploaded successfully</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#F5A623]" />
                    <p className="text-neutral-400">
                      {licenseDropzone.isDragActive
                        ? "Drop the file here"
                        : "Drag and drop your file here, or click to select"}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Maximum file size: 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Background Check
            </label>
            <div
              {...backgroundDropzone.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${backgroundDropzone.isDragActive ? 'border-[#F5A623] bg-[#F5A623]/10' : 'border-neutral-700 hover:border-[#F5A623]'}
              `}
            >
              <input {...backgroundDropzone.getInputProps()} />
              <div className="flex flex-col items-center space-y-2">
                {backgroundFile ? (
                  <>
                    <Check className="w-8 h-8 text-green-500" />
                    <p className="text-green-500">Background check uploaded successfully</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#F5A623]" />
                    <p className="text-neutral-400">
                      {backgroundDropzone.isDragActive
                        ? "Drop the file here"
                        : "Drag and drop your file here, or click to select"}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Maximum file size: 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#F5A623] text-white py-2 px-4 rounded-lg disabled:bg-neutral-400"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}