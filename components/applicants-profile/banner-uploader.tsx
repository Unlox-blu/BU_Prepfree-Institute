"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { Camera } from "lucide-react";

// Utility to crop image and return base64
export const getCroppedImg = (
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
  aspectRatio: number = 16 / 9 // 👈 Default banner ratio
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      // Calculate output dimensions for banner
      const outputWidth = 1200; // 👈 You can adjust this (e.g., 1920 for full HD banner)
      const outputHeight = outputWidth / aspectRatio;

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Draw the cropped area onto the banner canvas
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        outputWidth,
        outputHeight
      );

      const base64Image = canvas.toDataURL("image/jpeg", 0.9);
      resolve(base64Image);
    };

    image.onerror = (err) => reject(err);
  });
};

const BannerImageUploader = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropModal, setShowCropModal] = useState(false);
  const [finalImage, setFinalImage] = useState<string | null>(null);

  // Trigger file input when clicking the Upload button
  const handleCamClick = () => {
    document.getElementById("bannerInput")?.click();
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Save cropped image
  const handleCropComplete = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc!, croppedAreaPixels);
      setFinalImage(croppedImage);
      setShowCropModal(false);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, imageSrc]);

  return (
    <div className="relative w-full h-36 bg-gray-200 rounded-lg overflow-hidden">
      {/* Banner Image */}
      {finalImage ? (
        <Image
          src={finalImage}
          alt="Banner"
          fill
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-500">
          No banner uploaded
        </div>
      )}

      {/* Upload Button */}
      {/* <button
        onClick={handleCamClick}
        className="bg-black/50 flex gap-1 w-fit absolute right-4 top-4 text-white p-2 rounded-md cursor-pointer"
      >
        <Camera />
        <h1>Upload Image</h1>
      </button> */}

      <input
        id="bannerInput"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-3xl flex flex-col gap-4">
            <div className="relative w-full h-[400px] bg-gray-200">
              <Cropper
                image={imageSrc!}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9} // 👈 Banner ratio
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_: any, croppedPixels: any) =>
                  setCroppedAreaPixels(croppedPixels)
                }
              />
            </div>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowCropModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleCropComplete}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerImageUploader;
