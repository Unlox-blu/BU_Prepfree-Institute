"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Loader2,
    Download,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    ClipboardCheck,
    Eye,
    ShieldCheck,
    Clock,
    Send,
    Copy,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { MouProgressStepper } from "@/components/institute/mou-progress-stepper";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`
    : "http://localhost:1995/api/v1";

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

type MouStatus = "sent" | "submitted" | "approved" | "rejected" | "withdrawn" | "students_uploaded" | "users_data_received" | "users_onboarded" | "credentials_sent";

// Screen states
type ScreenState = "loading" | "otp_sending" | "otp_verify" | "active" | "inactive" | "error";

interface MouData {
    id: string;
    token: string;
    status: MouStatus;
    poc_name: string;
    poc_email: string;
    poc_phone?: string;
    poc_role: string;
    sent_at: string;
    submitted_at?: string;
    approved_at?: string;
    student_xlsx_uploaded_at?: string;
    credentials_sent_at?: string;
    rejection_note?: string;
    rejected_at?: string;
    withdrawn_at?: string;
    institute_name: string;
    mou_url?: string;
    signed_mou_url?: string;
    student_xlsx_url?: string;
    institute_logo_url?: string;
}

const getInstituteStatusDisplay = (status: MouStatus) => {
    switch (status) {
        case "sent": return { label: "Pending Signature", className: "bg-blue-100 text-blue-700" };
        case "submitted": return { label: "Under Admin Review", className: "bg-amber-100 text-amber-700" };
        case "approved": return { label: "Pending Student Data", className: "bg-blue-100 text-blue-700" };
        case "rejected": return { label: "MOU Rejected", className: "bg-red-100 text-red-700" };
        case "withdrawn": return { label: "MOU Withdrawn", className: "bg-red-100 text-red-700" };
        case "students_uploaded": return { label: "Under Admin Review", className: "bg-amber-100 text-amber-700" };
        case "users_data_received": return { label: "Processing Student Data", className: "bg-amber-100 text-amber-700" };
        case "users_onboarded": return { label: "Users Onboarded", className: "bg-indigo-100 text-indigo-700" };
        case "credentials_sent": return { label: "Onboarding Complete", className: "bg-[#0B5B4D]/10 text-[#0B5B4D]" };
        default: return { label: "Unknown", className: "bg-gray-100 text-gray-700" };
    }
};

export default function PublicMouPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = React.use(params);

    // Session State
    const [screen, setScreen] = useState<ScreenState>("loading");
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [otpMessage, setOtpMessage] = useState<string>("");
    const [otpInput, setOtpInput] = useState<string>("");
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [otpResending, setOtpResending] = useState(false);
    const [rateLimited, setRateLimited] = useState(false);
    const [retryAfter, setRetryAfter] = useState<number>(0);

    // Data State
    const [mou, setMou] = useState<MouData | null>(null);
    const [signedFile, setSignedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

    // Inactivity Timer
    const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const jwtRef = useRef<string | null>(null);
    useEffect(() => { jwtRef.current = jwtToken; }, [jwtToken]);


    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(() => {
            setJwtToken(null);
            setScreen("inactive");
        }, INACTIVITY_TIMEOUT_MS);
    }, []);

    // Attach global activity listeners when session is active
    useEffect(() => {
        if (screen !== "active") {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            return;
        }
        const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
        events.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }));
        resetInactivityTimer();
        return () => {
            events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        };
    }, [screen, resetInactivityTimer]);

    // Auto-send OTP on mount
    const sendOtp = useCallback(async () => {
        setOtpResending(true);
        setRateLimited(false);
        try {
            const res = await fetch(`${API_BASE_URL}/public/mou/${token}/send-otp`, { method: "POST" });
            const json = await res.json();
            if (res.status === 429) {
                setRateLimited(true);
                setRetryAfter(json.retryAfter || 3600);
                setScreen("otp_verify");
                return;
            }
            if (!res.ok) throw new Error(json.message || "Failed to send OTP");
            setOtpMessage(json.message || "OTP sent to your registered email.");
            setScreen("otp_verify");
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to send OTP. Please try again.");
            setScreen("error");
        } finally {
            setOtpResending(false);
        }
    }, [token]);

    useEffect(() => {
        setScreen("otp_sending");
        sendOtp();
    }, [sendOtp]);

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (otpInput.trim().length !== 6) {
            toast.error("Please enter the 6-digit OTP");
            return;
        }
        setOtpVerifying(true);
        try {
            const res = await fetch(`${API_BASE_URL}/public/mou/${token}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp: otpInput.trim() }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Invalid OTP");
            setJwtToken(json.jwtToken);
            setOtpInput("");
            await fetchMouData(json.jwtToken);
        } catch (err: any) {
            toast.error(err.message || "Verification failed");
        } finally {
            setOtpVerifying(false);
        }
    };

    // Fetch MOU (requires JWT)
    const fetchMouData = useCallback(async (jwt: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/public/mou/${token}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Invalid or expired MOU link");
            setMou(json.mou);
            setScreen("active");
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to load MOU");
            setScreen("error");
        }
    }, [token]);

    // Auth-aware fetch helper
    const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
        const jwt = jwtToken;
        if (!jwt) throw new Error("Session expired");
        return fetch(url, {
            ...options,
            headers: {
                ...(options.headers as Record<string, string> || {}),
                Authorization: `Bearer ${jwt}`,
            },
        });
    }, [jwtToken]);

    // Download Helper
    const handleDownloadFile = async (url: string, filename: string) => {
        try {
            setDownloadingUrl(url);
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download directly. Opening in new tab...");
            window.open(url, "_blank");
        } finally {
            setDownloadingUrl(null);
        }
    };

    // Handle file selection and immediate upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (mou?.status === "sent") {
            if (file.type !== "application/pdf") {
                toast.error("Please select a PDF file");
                return;
            }
        }

        if (file.size > 20 * 1024 * 1024) {
            toast.error("File size should be less than 20MB");
            return;
        }

        setSignedFile(file);

        if (mou?.status === "sent") {
            await handleSubmitFlow(file);
        } else if (mou?.status === "approved") {
            await handleXlsxUploadFlow(file);
        }
    };

    // Submit signed MOU
    const handleSubmitFlow = async (fileToUpload: File) => {
        try {
            setUploading(true);

            const urlRes = await authFetch(`${API_BASE_URL}/public/mou/${token}/upload-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName: fileToUpload.name, fileType: fileToUpload.type }),
            });
            const urlJson = await urlRes.json();
            if (!urlRes.ok) throw new Error(urlJson.message || "Failed to get upload URL");

            const uploadRes = await fetch(urlJson.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": fileToUpload.type },
                body: fileToUpload,
            });
            if (!uploadRes.ok) throw new Error("Failed to upload file");

            const submitRes = await authFetch(`${API_BASE_URL}/public/mou/${token}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signed_mou_key: urlJson.key }),
            });
            const submitJson = await submitRes.json();
            if (!submitRes.ok) throw new Error(submitJson.message || "Failed to submit MOU");
            toast.success("Signed MOU submitted successfully!");
            setSignedFile(null);
            if (jwtRef.current) await fetchMouData(jwtRef.current);

        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setUploading(false);
        }
    };

    // Handle student XLSX upload
    const handleXlsxUploadFlow = async (fileToUpload: File) => {
        if (!mou) return;

        try {
            setUploading(true);

            const urlRes = await authFetch(`${API_BASE_URL}/public/mou/${token}/student-upload-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName: fileToUpload.name, fileType: fileToUpload.type }),
            });
            const urlJson = await urlRes.json();
            if (!urlRes.ok) throw new Error(urlJson.message || "Failed to get upload URL");

            const uploadRes = await fetch(urlJson.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": fileToUpload.type },
                body: fileToUpload,
            });
            if (!uploadRes.ok) throw new Error("Failed to upload file");

            const submitRes = await authFetch(`${API_BASE_URL}/public/mou/${token}/confirm-students`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ student_xlsx_key: urlJson.key }),
            });
            const submitJson = await submitRes.json();
            if (!submitRes.ok) throw new Error(submitJson.message || "Failed to submit student data");

            toast.success("Student data uploaded successfully!");
            setSignedFile(null);
            if (jwtRef.current) await fetchMouData(jwtRef.current);


        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setUploading(false);
        }
    };

    // Screen: Loading / Sending OTP
    if (screen === "loading" || screen === "otp_sending") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="animate-spin text-[#0B5B4D] mx-auto" size={36} />
                    <p className="text-sm text-gray-500">Sending verification code to your email…</p>
                </div>
            </div>
        );
    }

    // Screen: Inactive
    if (screen === "inactive") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-md p-10 max-w-sm w-full text-center border border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                        <Clock size={32} className="text-amber-500" />
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 mb-2">Session Inactive</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Your session has expired due to inactivity. For your security, please verify your identity again to continue.
                    </p>
                    <button
                        onClick={() => { setOtpInput(""); sendOtp(); }}
                        className="w-full flex items-center justify-center gap-2 bg-[#0B5B4D] hover:bg-[#074238] text-white font-medium py-2.5 px-4 rounded-lg transition"
                    >
                        <ShieldCheck size={16} />
                        Verify Again
                    </button>
                </div>
            </div>
        );
    }

    // Screen: Error
    if (screen === "error") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h1>
                    <p className="text-sm text-gray-500">{errorMsg || "This MOU link is not valid or has expired."}</p>
                </div>
            </div>
        );
    }

    // Screen: OTP Verify
    if (screen === "otp_verify") {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full border border-gray-100">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-full bg-[#EAF6EE] flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={28} className="text-[#0B5B4D]" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-1">Verify Your Identity</h1>
                        {rateLimited ? (
                            <p className="text-sm text-red-500">
                                Too many attempts. Please try again after{" "}
                                {Math.ceil(retryAfter / 60)} minute{retryAfter > 60 ? "s" : ""}.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500">{otpMessage}</p>
                        )}
                    </div>

                    <div className="flex gap-2 mb-4 justify-center">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <input
                                key={i}
                                id={`otp-digit-${i}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={otpInput[i] || ""}
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, "").slice(-1);
                                    const next = otpInput.split("");
                                    next[i] = val;
                                    const updated = next.join("").slice(0, 6);
                                    setOtpInput(updated);
                                    if (val && i < 5) {
                                        document.getElementById(`otp-digit-${i + 1}`)?.focus();
                                    }
                                }}
                                onKeyDown={e => {
                                    if (e.key === "Backspace" && !otpInput[i] && i > 0) {
                                        document.getElementById(`otp-digit-${i - 1}`)?.focus();
                                    }
                                    if (e.key === "Enter") handleVerifyOtp();
                                }}
                                onFocus={e => e.target.select()}
                                className="w-11 h-12 text-center text-xl font-bold border-2 rounded-lg outline-none focus:ring-2 focus:ring-[#0B5B4D]/30 focus:border-[#0B5B4D] transition text-gray-900"
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleVerifyOtp}
                        disabled={otpVerifying || otpInput.length !== 6}
                        className="w-full flex items-center justify-center gap-2 bg-[#0B5B4D] hover:bg-[#074238] text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 mb-3"
                    >
                        {otpVerifying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {otpVerifying ? "Verifying…" : "Verify & Continue"}
                    </button>

                    {!rateLimited && (
                        <button
                            onClick={() => sendOtp()}
                            disabled={otpResending}
                            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-1.5 transition disabled:opacity-50"
                        >
                            {otpResending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                            {otpResending ? "Resending…" : "Resend OTP"}
                        </button>
                    )}

                    <p className="text-center text-xs text-gray-400 mt-4">
                        OTP expires in 10 minutes. Do not share it with anyone.
                    </p>
                </div>
            </div>
        );
    }

    // Screen: Active (MOU Page)
    if (!mou) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">

            {/* Full Width Header */}
            <header className="w-full bg-[#0B5B4D] py-4 px-6 md:px-12 flex items-center shadow-md justify-between">
                <Image
                    src="/images/logo.png"
                    alt="PrepFree Logo"
                    width={150}
                    height={45}
                    className="object-contain"
                />
                <div className="text-white/90 text-sm font-medium hidden sm:block">
                    Institute Onboarding Portal
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 w-full max-w-6xl p-4 sm:p-6 md:p-8 flex flex-col">
                <div className="bg-white md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">

                    {/* Top Row: Details & Actions */}
                    <div className="flex flex-col md:flex-row border-b border-gray-100">

                        {/* Top Left: Details */}
                        <div className="md:w-[280px] shrink-0 bg-gray-50/80 md:border-r border-b md:border-b-0 border-gray-100 p-6 md:p-8">

                            <div className="mb-8">
                                {mou.institute_logo_url && (
                                    <div className="mb-4">
                                        <img
                                            src={mou.institute_logo_url}
                                            alt={mou.institute_name}
                                            className="h-12 w-auto object-contain rounded"
                                        />
                                    </div>
                                )}
                                <h1 className="text-base font-bold text-gray-900 mb-1">{mou.institute_name}</h1>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-6">Details</p>

                                <div className="text-xs space-y-4">
                                    <div>
                                        <span className="block text-gray-400 mb-0.5 uppercase tracking-wide text-[10px]">POC Name</span>
                                        <span className="font-medium text-gray-800">{mou.poc_name}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 mb-0.5 uppercase tracking-wide text-[10px]">POC Role</span>
                                        <span className="font-medium text-gray-800">{mou.poc_role}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 mb-0.5 uppercase tracking-wide text-[10px]">POC Email</span>
                                        <span className="font-medium text-gray-800 break-all">{mou.poc_email}</span>
                                    </div>
                                    {mou.poc_phone && (
                                        <div>
                                            <span className="block text-gray-400 mb-0.5 uppercase tracking-wide text-[10px]">POC Phone</span>
                                            <span className="font-medium text-gray-800">{mou.poc_phone}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="block text-gray-400 mb-1.5 uppercase tracking-wide text-[10px]">Onboarding Status</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getInstituteStatusDisplay(mou.status as MouStatus).className}`}>
                                            {getInstituteStatusDisplay(mou.status as MouStatus).label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Top Right: Actions */}
                        <div className="flex-1 p-6 md:p-8">

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] flex items-center justify-center">
                                    <ClipboardCheck size={15} className="text-[#0B5B4D]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-[#1E1E1E]">Actions:</h2>
                                </div>
                            </div>

                            {/* Dynamic Action Area */}
                            {mou.status === "credentials_sent" ? (
                                <div className="bg-[#EAF6EE] border border-green-200 rounded-xl p-6 text-center shadow-sm">
                                    <CheckCircle2 size={48} className="text-[#0B5B4D] mx-auto mb-3" />
                                    <p className="font-bold text-lg text-[#0B5B4D] mb-1">Onboarding Complete!</p>
                                    <p className="text-sm text-[#0B5B4D]/80 mb-6">
                                        The administration has generated credentials and sent securely via emails for your institute and students.
                                    </p>

                                    <div className="space-y-3 w-full">
                                        {/* Student Portal Link */}
                                        <div className="bg-white rounded-lg border border-green-100 p-3 shadow-sm text-left">
                                            <p className="text-xs font-bold text-[#0B5B4D] uppercase tracking-wider mb-2">Student Portal</p>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value="https://learner.prepfree.in"
                                                    className="flex-1 bg-gray-50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-600 outline-none"
                                                />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText("https://learner.prepfree.in");
                                                        toast.success("Student Portal link copied!");
                                                    }}
                                                    className="p-2 bg-[#EAF6EE] hover:bg-[#d6f0df] text-[#0B5B4D] rounded transition-colors"
                                                    title="Copy Student Portal Link"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Institute Portal Link */}
                                        <div className="bg-white rounded-lg border border-green-100 p-3 shadow-sm text-left">
                                            <p className="text-xs font-bold text-[#0B5B4D] uppercase tracking-wider mb-2">Institute Portal</p>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value="https://institute.prepfree.in"
                                                    className="flex-1 bg-gray-50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-600 outline-none"
                                                />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText("https://institute.prepfree.in");
                                                        toast.success("Institute Portal link copied!");
                                                    }}
                                                    className="p-2 bg-[#EAF6EE] hover:bg-[#d6f0df] text-[#0B5B4D] rounded transition-colors"
                                                    title="Copy Institute Portal Link"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            ) : (mou.status === "students_uploaded" || mou.status === "users_data_received") ? (
                                /* Student data received — waiting for admin to process */
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                                    <AlertCircle size={36} className="text-amber-500 mx-auto mb-2" />
                                    <p className="font-semibold text-amber-700">Student Data Received</p>
                                    <p className="text-xs text-amber-700/80 mt-1">
                                        We have received your student data sheet. The admin team is processing it — please wait for the next step.
                                    </p>
                                </div>

                            ) : mou.status === "users_onboarded" ? (
                                /* Users onboarded — waiting for admin to send credentials */
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
                                    <AlertCircle size={36} className="text-indigo-500 mx-auto mb-2" />
                                    <p className="font-semibold text-indigo-700">Users Successfully Onboarded</p>
                                    <p className="text-xs text-indigo-700/80 mt-1">
                                        Your users have been onboarded. The admin team will send login credentials to the POC shortly.
                                    </p>
                                </div>

                            ) : mou.status === "approved" ? (
                                /* MOU approved — institute needs to upload student data */
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 mb-2">Next Step — Upload Student Data</p>
                                    <p className="text-xs text-gray-500 mb-4">
                                        The MOU has been approved! Please upload the student data list (Excel format, .xlsx) for cohort creation.
                                    </p>
                                    <label className={`w-full flex items-center justify-center gap-2 bg-[#0B5B4D] hover:bg-[#084238] text-white font-medium py-3 px-4 rounded-lg transition cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                        {uploading ? "Uploading..." : "Submit Student Data (.xlsx)"}
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>

                            ) : mou.status === "rejected" ? (
                                /* MOU Rejected */
                                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                    <AlertCircle size={42} className="text-red-500 mx-auto mb-3" />
                                    <p className="font-bold text-lg text-red-700 mb-1">MOU Rejected</p>
                                    <p className="text-sm text-red-600/80 mb-4">
                                        Your signed MOU submission has been reviewed and was not approved.
                                    </p>
                                    {mou.rejection_note && (
                                        <div className="bg-white border border-red-100 rounded-lg p-4 mb-4 text-left">
                                            <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">Admin Note</p>
                                            <p className="text-sm text-gray-700">{mou.rejection_note}</p>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        For further clarification, please contact <a href="mailto:support@prepfree.in" className="text-[#0B5B4D] font-medium hover:underline">support@prepfree.in</a>
                                    </p>
                                </div>

                            ) : mou.status === "withdrawn" ? (
                                /* MOU Withdrawn */
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                                    <AlertCircle size={42} className="text-gray-500 mx-auto mb-3" />
                                    <p className="font-bold text-lg text-gray-700 mb-1">Partnership Concluded</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        This MOU partnership has been withdrawn by the administration. All associated access and onboarding progress has been concluded.
                                    </p>
                                    {mou.rejection_note && (
                                        <div className="bg-white border border-gray-100 rounded-lg p-4 mb-4 text-left">
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Admin Note</p>
                                            <p className="text-sm text-gray-700">{mou.rejection_note}</p>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        If you believe this is an error or need further assistance, please contact <a href="mailto:support@prepfree.in" className="text-[#0B5B4D] font-medium hover:underline">support@prepfree.in</a>
                                    </p>
                                </div>

                            ) : mou.status === "submitted" ? (
                                /* Signed MOU submitted — waiting for admin approval */
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                                    <AlertCircle size={36} className="text-amber-500 mx-auto mb-2" />
                                    <p className="font-semibold text-amber-700">Currently Under Admin Review</p>
                                    <p className="text-xs text-amber-700/80 mt-1">
                                        We have received your signed MOU. Please wait for the admin team to review and approve it.
                                    </p>
                                </div>

                            ) : (
                                /* Default: sent — institute needs to sign and upload MOU */
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 mb-2">Upload Signed MOU</p>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Please download the MOU Document, sign it, and upload the scanned copy here.
                                    </p>

                                    {mou.rejection_note && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-left">
                                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Resubmission Required</p>
                                            <p className="text-sm text-gray-700">{mou.rejection_note}</p>
                                        </div>
                                    )}

                                    {mou.mou_url && (
                                        <button
                                            onClick={() => handleDownloadFile(mou.mou_url!, `${mou.institute_name} - Original MOU.pdf`)}
                                            disabled={downloadingUrl === mou.mou_url}
                                            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#0B5B4D] border border-gray-200 font-medium py-2.5 px-4 rounded-lg transition mb-4 disabled:opacity-50 shadow-sm"
                                        >
                                            {downloadingUrl === mou.mou_url ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                            Download MOU Document
                                        </button>
                                    )}

                                    <label className={`w-full flex items-center justify-center gap-2 bg-[#0B5B4D] hover:bg-[#074238] text-white font-medium py-3 px-4 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                        {uploading ? "Uploading..." : "Submit Signed MOU Document"}
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row: Progress & Documents */}
                    <div className="flex flex-col md:flex-row flex-1">

                        {/* Bottom Left: Progress */}
                        <div className="md:w-[280px] shrink-0 bg-gray-50/80 md:border-r border-b md:border-b-0 border-gray-100 p-6 md:p-8">
                            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-4">Onboarding Progress</p>
                            <MouProgressStepper mou={mou as any} />
                        </div>

                        {/* Bottom Right: Documents */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col">

                            <div className="mb-0">
                                <p className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Documents</p>
                                <div className="space-y-2">
                                    {/* Original MOU */}
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <FileText size={16} className="text-[#0B5B4D]" />
                                            MOU Document
                                        </div>
                                        {mou.mou_url ? (
                                            <button onClick={() => handleDownloadFile(mou.mou_url!, `${mou.institute_name} - MOU Document.pdf`)}
                                                disabled={downloadingUrl === mou.mou_url}
                                                className="text-[#0B5B4D] bg-[#EAF6EE] hover:bg-[#0B5B4D] hover:text-white p-2 rounded transition-colors flex items-center justify-center disabled:opacity-50"
                                                title="View Document"
                                            >
                                                {downloadingUrl === mou.mou_url ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400">Not uploaded</span>
                                        )}
                                    </div>

                                    {/* Signed MOU */}
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <FileText size={16} className="text-[#0B5B4D]" />
                                            Signed MOU Document
                                        </div>
                                        {mou.signed_mou_url ? (
                                            <button onClick={() => handleDownloadFile(mou.signed_mou_url!, `${mou.institute_name} - Signed MOU.pdf`)}
                                                disabled={downloadingUrl === mou.signed_mou_url}
                                                className="text-[#0B5B4D] bg-[#EAF6EE] hover:bg-[#0B5B4D] hover:text-white p-2 rounded transition-colors flex items-center justify-center disabled:opacity-50"
                                                title="View Document"
                                            >
                                                {downloadingUrl === mou.signed_mou_url ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400">Not uploaded</span>
                                        )}
                                    </div>

                                    {/* Student Data */}
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <FileText size={16} className="text-[#0B5B4D]" />
                                            Student Data
                                        </div>
                                        {mou.student_xlsx_url ? (
                                            <button onClick={() => handleDownloadFile(mou.student_xlsx_url!, `${mou.institute_name} - Students.xlsx`)}
                                                disabled={downloadingUrl === mou.student_xlsx_url}
                                                className="text-[#0B5B4D] bg-[#EAF6EE] hover:bg-[#0B5B4D] hover:text-white p-2 rounded transition-colors flex items-center justify-center disabled:opacity-50"
                                                title="View Document"
                                            >
                                                {downloadingUrl === mou.student_xlsx_url ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400">Not uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
