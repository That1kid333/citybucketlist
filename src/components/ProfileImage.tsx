import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface ProfileImageProps {
  photo: string;
  isEditing: boolean;
  onImageChange: (file: File) => void;
}

export function ProfileImage({ photo, isEditing, onImageChange }: ProfileImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/png') {
      onImageChange(file);
    } else {
      alert('Please select a PNG image file.');
    }
  };

  return (
    <div className="relative">
      <img
        src={photo}
        alt="Profile"
        className="w-24 h-24 rounded-lg object-cover"
      />
      {isEditing && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            accept=".png"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-[#F5A623] rounded-full hover:bg-[#E09612] transition-colors"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        </>
      )}
    </div>
  );
}