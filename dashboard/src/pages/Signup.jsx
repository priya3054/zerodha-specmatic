import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3002";

const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [usernameStatus, setUsernameStatus] = useState("idle");
  // idle | invalid | checking | available | taken

  // 🔁 Username validation + availability check
  useEffect(() => {
    if (!form.username) {
      setUsernameStatus("idle");
      return;
    }

    // Step 1: regex validation
    if (!usernameRegex.test(form.username)) {
      setUsernameStatus("invalid");
      return;
    }

    // Step 2: check availability
    setUsernameStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/auth/check-username?username=${form.username}`
        );
        const data = await res.json();

        setUsernameStatus(data.available ? "available" : "taken");
      } catch (err) {
        console.error(err);
        setUsernameStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.username]);

  const submit = async (e) => {
    e.preventDefault();

    if (usernameStatus !== "available") {
      alert("Please choose a valid and available username");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      setUser(data.user);
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center">
      <form
        onSubmit={submit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Join Zerodha today
        </p>

        {/* USERNAME */}
        <input
          type="text"
          placeholder="User ID"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          className={`w-full mb-2 p-3 border rounded-lg focus:outline-none transition
            ${
              usernameStatus === "invalid" || usernameStatus === "taken"
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : usernameStatus === "available"
                ? "border-green-500 focus:ring-2 focus:ring-green-500"
                : "border-gray-300 focus:ring-2 focus:ring-green-500"
            }`}
        />

        {/* STATUS TEXT */}
        {usernameStatus === "invalid" && (
          <p className="text-red-500 text-sm mb-2">
            Must be 6+ characters with letters and numbers
          </p>
        )}
        {usernameStatus === "checking" && (
          <p className="text-gray-500 text-sm mb-2">
            Checking availability...
          </p>
        )}
        {usernameStatus === "taken" && (
          <p className="text-red-500 text-sm mb-2">
            Username already taken
          </p>
        )}
        {usernameStatus === "available" && (
          <p className="text-green-600 text-sm mb-2">
            Username available ✓
          </p>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          onChange={(e)=>setForm({...form,email:e.target.value})}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          onChange={(e)=>setForm({...form,password:e.target.value})}
          className="w-full mb-6 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          disabled={usernameStatus === "checking"}
          className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition duration-200 disabled:opacity-50"
        >
          Create Account
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-600 cursor-pointer font-medium"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;