"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, Image as ImageIcon, UserRound } from "lucide-react";
import eventBg from "@/public/images/eventsBg.png";
import HighlightGuests from "@/components/dashboard/highlight-guest";

interface Guest {
  id: number;
  name: string;
  title: string;
  bio: string;
  email: string;
  emailNotif: boolean;
  linkedinId: string;
}

interface Event {
  id: number;
  thumbnail: any;
  eventName: string;
  eventCategory: string;
  startDate: string;
  endDate: string;
  orgMembers: string;
  mode: string;
  loc: string;
  deadline: string;
  slotLimit: string;
  minScore: string;
  orgName: string;
  guestDetails: Guest[];
  desc: string;
  resources: any;
  attendance: string;
}

const Page = () => {
  const [events, setEvents] = useState<Event[]>([
    // Example data (you can start with an empty array [])
    // {
    //   id: 1,
    //   thumbnail: "",
    //   eventName: "Tech Conference 2025",
    //   eventCategory: "Technology",
    //   startDate: "2025-11-10",
    //   endDate: "2025-11-12",
    //   orgMembers: "Team Alpha",
    //   mode: "Online",
    //   loc: "Zoom",
    //   deadline: "2025-11-09",
    //   slotLimit: "100",
    //   minScore: "0",
    //   orgName: "TechOrg",
    //   guestDetails: [
    //     {
    //       id: 1,
    //       name: "John Doe",
    //       title: "CEO, TechCorp",
    //       bio: "Tech enthusiast and innovator.",
    //       email: "john@example.com",
    //       emailNotif: true,
    //       linkedinId: "john-doe",
    //     },
    //   ],
    //   desc: "An event about future tech trends.",
    //   resources: "",
    //   attendance: "Required",
    // },
  ]);

  const [edit, setEdit] = useState(true);
  const [editIndex, setEditIndex] = useState();

  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleCreate = () => {
    setEdit(true);
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Upcoming Events</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-[#0B5B4D] text-sm rounded-md text-white font-medium"
        >
          Create Event
        </button>
      </div>

      {edit && (
        <div className="w-[60%] h-full overflow-y-auto flex flex-col gap-4">
          <div className="w-full bg-white rounded-xl p-6 flex flex-col gap-1">
            <h1 className="font-medium text-lg">Basic Details of the Events</h1>
            <p className="text-sm text-black/89">
              What are the key details of this Event?
            </p>
            <div className="flex gap-4 items-center mt-1">
              <div className="w-[300px] h-[150px] bg-[#f8f8f8] flex items-center justify-center">
                <ImageIcon fill="#C7DCD3" stroke="white" />
              </div>
              <h1 className="font-medium text-md">Upload Event Thumbnail</h1>
            </div>
            <div className="flex gap-4 w-full">
              <div className="flex flex-col gap-1 w-1/2">
                <label>
                  Event Name<span className="text-[#FF2828]">*</span>
                </label>
                <input
                  type="text"
                  //   onChange={handleChange}
                  name="firstName"
                  //   value={formData.firstName}
                  placeholder="xyz"
                  className="border rounded-md p-2"
                />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <label>
                  Event Category<span className="text-[#FF2828]">*</span>
                </label>
                <input
                  type="text"
                  //   onChange={handleChange}
                  name="lastName"
                  //   value={formData.lastName}
                  placeholder="xyz"
                  className="border rounded-md p-2"
                />
              </div>
            </div>
            <div className="flex gap-4 w-full">
              <div className="flex flex-col gap-1 w-1/2">
                <label>
                  Event Start Date & Time
                  <span className="text-[#FF2828]">*</span>
                </label>
                <input
                  type="text"
                  //   onChange={handleChange}
                  name="firstName"
                  //   value={formData.firstName}
                  placeholder="xyz"
                  className="border rounded-md p-2"
                />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <label>
                  Event End Date & Time<span className="text-[#FF2828]">*</span>
                </label>
                <input
                  type="text"
                  //   onChange={handleChange}
                  name="lastName"
                  //   value={formData.lastName}
                  placeholder="xyz"
                  className="border rounded-md p-2"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label>
                Organizing Members<span className="text-[#FF2828]">*</span>
              </label>
              <input
                type="text"
                //   onChange={handleChange}
                name="firstName"
                //   value={formData.firstName}
                placeholder="xyz"
                className="border rounded-md p-2"
              />
            </div>
            <div className="flex gap-4 w-full">
              <div className="flex flex-col gap-1 w-1/2">
                <label>
                  Event Mode
                  <span className="text-[#FF2828]">*</span>
                </label>
                <input
                  type="text"
                  //   onChange={handleChange}
                  name="firstName"
                  //   value={formData.firstName}
                  placeholder="xyz"
                  className="border rounded-md p-2"
                />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <label>
                  In-Person Location<span className="text-[#FF2828]">*</span>
                </label>
                <input
                  type="text"
                  //   onChange={handleChange}
                  name="lastName"
                  //   value={formData.lastName}
                  placeholder="xyz"
                  className="border rounded-md p-2"
                />
              </div>
            </div>
            <div className="flex gap-4 w-full">
              <div className="flex flex-col gap-1 w-1/2">
                <label>
                  Registration Deadline
                  <span className="text-[#FF2828]">*</span>
                </label>
                <input
                  type="text"
                  //   onChange={handleChange}
                  name="firstName"
                  //   value={formData.firstName}
                  placeholder="xyz"
                  className="border rounded-md p-2"
                />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <label>
                  Registration Slot Limit
                  <span className="text-[#FF2828]">*</span>
                </label>
                <input
                  type="text"
                  //   onChange={handleChange}
                  name="lastName"
                  //   value={formData.lastName}
                  placeholder="xyz"
                  className="border rounded-md p-2"
                />
              </div>
            </div>
            <div className="flex gap-4 w-full">
              <div className="flex flex-col gap-1 w-1/2">
                <label>
                  Score/ Points For attending
                  <span className="text-[#FF2828]">*</span>
                </label>
                <input
                  type="text"
                  //   onChange={handleChange}
                  name="firstName"
                  //   value={formData.firstName}
                  placeholder="xyz"
                  className="border rounded-md p-2"
                />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <label>Organization Committee Name</label>
                <input
                  type="text"
                  //   onChange={handleChange}
                  name="lastName"
                  //   value={formData.lastName}
                  placeholder="xyz"
                  className="border rounded-md p-2"
                />
              </div>
            </div>
          </div>
          <HighlightGuests />
          <div className="w-full bg-white rounded-xl p-6 flex flex-col gap-1">
            <h1 className="font-medium text-lg">
              Description<span className="text-[#FF2828]">*</span>
            </h1>
            <p className="text-sm text-black/89">
              Please mention about the event in detail
            </p>
            <textarea
              rows={5}
              className="border rounded-md p-2"
              placeholder="xyz"
            />
          </div>
          <div className="w-full bg-white rounded-xl p-6 flex flex-col gap-1">
            <h1 className="font-medium text-lg">Event Resources</h1>
            <p className="text-sm text-black/89">
              Upload and manage event-related documents to provide students with
              all necessary materials.
            </p>
            <div className="flex gap-2 items-center justify-start w-full mt-1">
              <button className="border-2 border-[#0B5B4D] p-2 rounded-md text-[#0B5B4D]">
                Upload File
              </button>
              <button className="border-2 border-[#0B5B4D] bg-[#0B5B4D] px-6 py-2 rounded-md text-white">
                Add Link
              </button>
            </div>
          </div>
          <div className="w-full bg-white rounded-xl p-6 flex flex-col gap-1 mb-15">
            <h1 className="font-medium text-lg">
              Attendance Format<span className="text-[#FF2828]">*</span>
            </h1>
            <div className="flex flex-col items-start gap-2 w-full mt-1">
              <div className="flex gap-1">
                <input type="radio" id="attendance" />
                <h1 className="text-xs">
                  Admins: Manual (Only you will be able to mark attendance.
                  Candidates will be informed to contact you for attendance)
                </h1>
              </div>
              <div className="flex gap-1">
                <input type="radio" id="attendance" />
                <h1 className="text-xs">
                  Admins: Manual + Candidates: QR Code/Join Now button (You &
                  Candidates will be able to mark attendance)
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-white shadow-md rounded-xl border border-gray-200"
            >
              <h2 className="text-lg font-bold mb-1">{event.eventName}</h2>
              <p className="text-sm text-gray-600 mb-1">
                Category: {event.eventCategory}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Mode: {event.mode} • {event.loc}
              </p>
              <p className="text-sm text-gray-600">
                Duration: {event.startDate} - {event.endDate}
              </p>
            </div>
          ))}
        </div>
      )}

      {events.length === 0 && !edit && (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
          <Image
            src={eventBg}
            alt="Events Background"
            className="w-auto h-2/3"
          />
          <div className="text-black text-2xl font-semibold">
            No Upcoming Events
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
