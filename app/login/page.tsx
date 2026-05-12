"use client";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import HeroSlider from "@/components/HeroSlider";
import BU_Prepfree_logo from "@/public/images/BU_Prepfree_logo.svg";


const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isInstituteSubdomain, setIsInstituteSubdomain] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    // 1. Get Browser Hostname (e.g. institute.localhost)
    const hostname = window.location.hostname;

    // 2. Get Env Variable OR Default to 'localhost'
    let root = process.env.NEXT_PUBLIC_INSTITUTE_FRONTEND_URL || "localhost:3000";

    // Remove port if present
    root = root.split(':')[0];

    // 3. Construct Expected Domain
    const expectedDomain = `buinstitute.${root}`;

    // Debugging logs
    console.log("Login Page Debug:", {
      browserHostname: hostname,
      envRoot: root,
      expected: expectedDomain
    });

    // 4. Check
    if (hostname === expectedDomain) {
      setIsInstituteSubdomain(true);
    } else {
      setIsInstituteSubdomain(false);
      setDebugInfo(`Current: ${hostname} | Expected: ${expectedDomain}`);
    }
  }, []);

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
  const LOGIN_ENDPOINT = `${API_BASE}/api/v1/auth/login`;
  const EXCHANGE_ENDPOINT = `${API_BASE}/api/v1/auth/exchange-token`;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const payload = { ...formData, subdomain: 'institute' };

      const res = await axios.post(LOGIN_ENDPOINT, payload);
      const data = res.data;

      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken || "");
        localStorage.setItem("userType", data.userType);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
        toast.success("Login Successful!");
        router.push("/dashboard");
        return;
      }

      if (data.transferToken) {
        const exchange = await axios.post(EXCHANGE_ENDPOINT, {
          transferToken: data.transferToken,
        });
        const tokens = exchange.data;
        localStorage.setItem("token", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        localStorage.setItem("userType", tokens.userType);
        axios.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
        toast.success("Login Successful!");
        router.push("/dashboard");
        return;
      }

      toast.error("Unexpected response.");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Login failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <main className="w-full h-screen bg-[#071526] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="font-creato bg-[#193767] w-full h-screen flex items-center justify-center text-white overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-[#071526]/60" />

      <Toaster position="top-right" />

      {/* Outer Card Wrapper with Shining Edge */}
      <div className="relative z-10 w-[1000px] max-w-[95vw] h-[600px] max-h-[95vh] p-[2px] rounded-[24px] overflow-hidden shadow-[0px_4px_20px_0px_rgba(49,67,112,0.5)] flex bg-[#071526]">

        {/* Spinning Gradient for Shining Edge */}
        <div className="absolute top-1/2 left-1/2 w-[200%] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-full h-full animate-[spin_7s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_120deg,#9FB3C8_180deg,transparent_180deg_300deg,#9FB3C8_360deg)]" />
        </div>

        {/* Actual Card Content */}
        <div className="relative z-10 w-full h-full flex rounded-[22px] overflow-hidden bg-gradient-to-t from-[#071526] via-[#314370] to-[#071526]">
          {!isInstituteSubdomain ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white text-black p-14 text-center">
              <h1 className="text-3xl font-semibold text-red-400">
                Invalid Portal URL
              </h1>
              <p className="text-gray-600 mt-4">
                This application is for Institute Users only. <br />
                Please ensure you are accessing via <b>institute.{process.env.NEXT_PUBLIC_INSTITUTE_FRONTEND_URL?.split(':')[0] || 'localhost'}</b>
              </p>
              <p className="text-xs text-gray-500 mt-4 border border-gray-200 p-2 rounded bg-gray-50">
                Debug Info: {debugInfo}
              </p>
            </div>
          ) : (
            <>
              {/* Left Section */}
              <div className="w-1/2 flex flex-col items-center justify-center bg-white text-black h-full p-8 relative">
                <div className="w-full h-full flex flex-col gap-8">
                  <div className="flex flex-row">
                    <img src="/images/BU_Prepfree_logo.svg" alt="BU Prepfree Logo" className="w-[900px] h-auto mb-4" />
                  </div>


                  <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-medium mt-4">Institute Portal</h1>
                    <p className="text-xs">For Admins, TPOs, and HODs. Enter Email address and password to log in.</p>
                  </div>

                  <div className="w-full flex flex-col gap-6 ">
                    <div className="flex flex-col gap-1">
                      <label className="font-medium text-xs">Email Address*</label>
                      <input
                        type="text"
                        name="email"
                        placeholder="name@institute.com"
                        className="bg-[#F8F8F8] py-2 px-1 rounded-sm text-black text-xs"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="flex flex-col gap-1 relative">
                      <label className="font-medium text-xs">Password*</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter Password"
                          className="bg-[#F8F8F8] py-2 px-1 text-xs rounded-sm text-black w-full pr-10"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-[#810505] text-white font-medium py-3 text-sm flex items-center justify-center rounded-sm mt-2 hover:bg-[#314370] transition"
                  >
                    {loading ? "Logging In..." : "Log In"}
                  </button>

                  <p className="text-[10px] font-light text-center mt-2 text-gray-400">
                    By logging in, you agree to our{" "}
                    <span className="underline cursor-pointer">Terms of Service</span> and{" "}
                    <span className="cursor-pointer">Privacy Policy</span>.
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="w-1/2 h-full flex flex-col relative items-start overflow-hidden">
                <div className="w-full h-full">
                  <HeroSlider />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default LoginPage;