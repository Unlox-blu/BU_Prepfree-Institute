"use client";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

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
    // CHANGED: Using NEXT_PUBLIC_INSTITUTE_FRONTEND_URL
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
        toast.success("Login Successful!", { id: "login-success" });
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
        toast.success("Login Successful!", { id: "login-success" });
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
    <main className="w-full h-screen flex items-center justify-center p-24 bg-gradient-to-t from-[#071526] to-[#0d1f3c] text-white">
      
      {!isInstituteSubdomain ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold text-red-400">
            Invalid Portal URL
          </h1>
          <p className="text-gray-300">
            This application is for Institute Users only. <br/>
            Please ensure you are accessing via <b>institute.{process.env.NEXT_PUBLIC_INSTITUTE_FRONTEND_URL?.split(':')[0] || 'localhost'}</b>
          </p>
          <p className="text-xs text-gray-500 mt-4 border border-gray-700 p-2 rounded bg-black/50">
            Debug Info: {debugInfo}
          </p>
        </div>
      ) : (
        <>
          <div className="w-1/2 flex flex-col items-center gap-4 px-14">
            <div className="flex flex-col items-center gap-2 mb-2">
               <h1 className="text-3xl font-bold">Institute Portal</h1>
               <p className="text-sm text-gray-300">For Admins, TPOs, and HODs</p>
            </div>

            <div className="w-full flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium ml-1">Email Address</label>
                <input
                  type="text"
                  name="email"
                  placeholder="name@institute.com"
                  className="bg-white py-3 px-4 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#9E2339]"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1 relative">
                <label className="text-sm font-medium ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter Password"
                    className="bg-white py-3 px-4 rounded-lg text-black w-full pr-10 focus:outline-none focus:ring-2 focus:ring-[#9E2339]"
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

            <p className="text-xs font-light text-center mt-2 text-gray-400">
              By logging in, you agree to our{" "}
              <a className="text-[#9FB3C8] underline cursor-pointer">Terms of Service</a> and{" "}
              <span className="text-[#9FB3C8] cursor-pointer">Privacy Policy</span>.
            </p>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#071526] py-4 flex items-center justify-center rounded-full mt-4 hover:bg-[#1a2d4e] transition disabled:opacity-50"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </div>

          <div className="w-1/2 flex flex-col items-center">
          </div>
        </>
      )}
    </main>
  );
};

export default LoginPage;