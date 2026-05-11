"use client";
import React, { useState } from "react";
import { Camera, UserRound } from "lucide-react";

interface Guest {
  id: number;
  image: string | null;
  name: string;
  title: string;
  bio: string;
  email: string;
  linkedinId: string;
}

const HighlightGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: 1,
      image: null,
      name: "",
      title: "",
      bio: "",
      email: "",
      linkedinId: "",
    },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setGuests((prev) =>
        prev.map((guest) =>
          guest.id === id ? { ...guest, image: reader.result as string } : guest
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (id: number, field: keyof Guest, value: string) => {
    setGuests((prev) =>
      prev.map((guest) =>
        guest.id === id ? { ...guest, [field]: value } : guest
      )
    );
  };

  const handleAddGuest = () => {
    setGuests((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        image: null,
        name: "",
        title: "",
        bio: "",
        email: "",
        linkedinId: "",
      },
    ]);
  };

  return (
    <div className="w-full bg-white rounded-xl p-6 flex flex-col gap-1">
      <h1 className="font-medium text-lg">Highlight Guests/Speakers</h1>
      <p className="text-sm text-black/89">
        Mention details of any prominent Guests attending the event
      </p>

      {guests.map((guest, index) => (
        <div key={guest.id} className="w-full">
          <h2 className="font-semibold text-[#071526] mb-3">Guest {index + 1}</h2>

          <div className="w-full flex items-center gap-2 mt-4">
            <label htmlFor={`profile-${guest.id}`} className="relative cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-[#EAEEEB] flex items-center justify-center overflow-hidden">
                {guest.image ? (
                  <img
                    src={guest.image}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserRound
                    className="w-2/3 h-auto text-white"
                    fill="white"
                    strokeWidth={0}
                  />
                )}
              </div>

              {/* Camera Badge */}
              <div className="absolute bottom-0 right-0 w-7 h-7 p-1 bg-white text-[#071526] rounded-full flex items-center justify-center border border-gray-200">
                <Camera className="w-4 h-4" />
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                id={`profile-${guest.id}`}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, guest.id)}
              />
            </label>
            <h1 className="text-[#071526] font-medium text-sm">
              Upload Profile Photo
            </h1>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex flex-col gap-1 items-start w-1/2">
              <label>Name</label>
              <input
                type="text"
                value={guest.name}
                onChange={(e) => handleChange(guest.id, "name", e.target.value)}
                placeholder="Full Name"
                className="w-full px-2 py-4 rounded-md border border-black/20"
              />
            </div>
            <div className="flex flex-col gap-1 items-start w-1/2">
              <label>Title/Designation</label>
              <input
                type="text"
                value={guest.title}
                onChange={(e) => handleChange(guest.id, "title", e.target.value)}
                placeholder="Designation or Role"
                className="w-full px-2 py-4 rounded-md border border-black/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex flex-col gap-1 items-start w-1/2">
              <label>Short Bio</label>
              <input
                type="text"
                value={guest.bio}
                onChange={(e) => handleChange(guest.id, "bio", e.target.value)}
                placeholder="Short introduction"
                className="w-full px-2 py-4 rounded-md border border-black/20"
              />
            </div>
            <div className="flex flex-col gap-1 items-start w-1/2">
              <label>Guest Email (Not visible to students)</label>
              <input
                type="email"
                value={guest.email}
                onChange={(e) => handleChange(guest.id, "email", e.target.value)}
                placeholder="Email"
                className="w-full px-2 py-4 rounded-md border border-black/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 items-start w-full mt-4">
            <label>LinkedIn ID</label>
            <input
              type="text"
              value={guest.linkedinId}
              onChange={(e) => handleChange(guest.id, "linkedinId", e.target.value)}
              placeholder="LinkedIn Profile URL"
              className="w-full px-2 py-4 rounded-md border border-black/20"
            />
          </div>
        </div>
      ))}

      <div
        className="flex text-[#071526] cursor-pointer hover:underline w-fit mt-1"
        onClick={handleAddGuest}
      >
        Add More +
      </div>
    </div>
  );
};

export default HighlightGuests;
