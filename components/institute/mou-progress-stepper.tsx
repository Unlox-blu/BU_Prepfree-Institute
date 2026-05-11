import React from "react";

export type StepperMouStatus = "sent" | "submitted" | "approved" | "rejected" | "withdrawn" | "students_uploaded" | "credentials_sent";

export interface StepperMouData {
    status: string;
    sent_at?: string;
    submitted_at?: string;
    approved_at?: string;
    student_xlsx_uploaded_at?: string;
    users_onboarded_at?: string;
    credentials_sent_at?: string;
    rejected_at?: string;
    withdrawn_at?: string;
}

const PROGRESS_IDX: Record<string, number> = {
    sent: 1,
    submitted: 2,
    approved: 3,
    users_data_received: 4,
    users_onboarded: 5,
    credentials_sent: 6,
};

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-GB") : undefined;

export const MouProgressStepper = ({ mou }: { mou: StepperMouData }) => {
    const isRejected = mou.status === "rejected";
    const isWithdrawn = mou.status === "withdrawn";
    const isTerminal = isRejected || isWithdrawn;

    const steps = isTerminal ? [
        { label: "MOU Received", desc: fmt(mou.sent_at) ?? "—", isReject: false },
        { label: "Upload Signed MOU Document", desc: fmt(mou.submitted_at) ?? "Awaiting your upload", isReject: false },
        { label: isWithdrawn ? "Withdrawn" : "Rejected", desc: fmt(isWithdrawn ? mou.withdrawn_at : mou.rejected_at) ?? (isWithdrawn ? "Partnership concluded" : "Submission rejected"), isReject: true },
    ] : [
        { label: "MOU Received", desc: fmt(mou.sent_at) ?? "—", isReject: false },
        { label: "Upload Signed MOU Document", desc: fmt(mou.submitted_at) ?? "Awaiting your upload", isReject: false },
        { label: "MOU Approval", desc: fmt(mou.approved_at) ?? "Pending admin review", isReject: false },
        { label: "Upload Data", desc: fmt(mou.student_xlsx_uploaded_at) ?? "Awaiting user data upload from your side", isReject: false },
        { label: "Users Onboarded", desc: fmt(mou.users_onboarded_at) ?? "Pending processing", isReject: false },
        { label: "Credentials Received", desc: fmt(mou.credentials_sent_at) ?? "Pending", isReject: false },
    ];

    const progress = isTerminal
        ? 2
        : (PROGRESS_IDX[mou.status] ?? 0);

    return (
        <div className="flex flex-col pl-1 py-1">
            {steps.map((step, i) => {
                const isDone = i < progress;
                const isActive = i === progress;
                const isLast = i === steps.length - 1;

                const dotColor = isDone
                    ? "bg-[#071526] border-[#071526]"
                    : isActive
                        ? step.isReject ? "bg-red-500 border-red-500" : "bg-white border-[#071526]"
                        : "bg-white border-gray-300";

                const lineColor = isDone ? "bg-[#071526]" : "bg-gray-200";

                return (
                    <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 transition-all duration-300 flex items-center justify-center ${dotColor}`}>
                                {isDone && !step.isReject && (
                                    <svg viewBox="0 0 10 10" className="w-full h-full p-0.5" style={{ transform: "scale(1.2)" }}>
                                        <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                {isActive && !step.isReject && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#071526]" />
                                )}
                                {isActive && step.isReject && (
                                    <svg viewBox="0 0 10 10" className="w-full h-full p-0.5">
                                        <line x1="2" y1="2" x2="8" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                        <line x1="8" y1="2" x2="2" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                )}
                            </div>
                            {!isLast && <div className={`w-0.5 flex-1 min-h-[26px] my-0.5 rounded transition-all duration-300 ${lineColor}`} />}
                        </div>
                        <div className="pb-4">
                            <p className={`text-[12px] font-semibold leading-tight ${isActive ? step.isReject ? "text-red-600" : "text-[#071526]" : isDone ? "text-gray-800" : "text-gray-400"}`}>
                                {step.label}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{step.desc}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
