import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../components/inputs/input";
import ProfilePhotoSelector from "../../components/inputs/ProfilePhotoSelector";

import { validateEmail } from "../../utils/helper";
import { API_PATHS } from "../../utils/apiPath";
import axiosInstance from "../../utils/axiosinstance";
import uploadImage from "../../utils/uploadimage";
import { UserContext } from "../../Context/userContext";

const SignUp = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!fullName.trim()) {
      return setError("Please enter full name.");
    }

    if (!validateEmail(email.trim())) {
      return setError("Please enter a valid email address.");
    }

    if (!password.trim()) {
      return setError("Please enter the password.");
    }

    setError("");
    setLoading(true);

    try {
      let profileImageUrl = "";

      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes?.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
      });

      // ✅ BACKEND RETURNS USER FIELDS DIRECTLY
      const {
        token,
        _id,
        name,
        email: userEmail,
        profileImageUrl: img,
      } = response.data;

      if (!token) {
        setError("Invalid signup response");
        return;
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("token", token);

      // ✅ SAVE USER (NO TOKEN INSIDE USER)
      updateUser({
        _id,
        name,
        email: userEmail,
        profileImageUrl: img,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[90vw] md:w-[33vw] p-7 bg-white rounded-lg">
      <h3 className="text-lg font-semibold text-black">Create an Account</h3>
      <p className="text-xs text-slate-700 mt-1 mb-6">
        Join us today by entering your details below
      </p>

      <ProfilePhotoSelector
        image={profilePic}
        setImage={setProfilePic}
        preview={preview}
        setPreview={setPreview}
      />

      <form onSubmit={handleSignUp} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          type="text"
          value={fullName}
          onChange={(e) => {
            setError("");
            setFullName(e.target.value);
          }}
        />

        <Input
          label="Email Address"
          placeholder="gautam@example.com"
          type="email"
          value={email}
          onChange={(e) => {
            setError("");
            setEmail(e.target.value);
          }}
        />

        <Input
          label="Password"
          placeholder="Min 8 Characters"
          type="password"
          value={password}
          onChange={(e) => {
            setError("");
            setPassword(e.target.value);
          }}
        />

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "SIGN UP"}
        </button>

        <p className="text-[13px] text-slate-800 text-center mt-3">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary underline"
            onClick={() => setCurrentPage("login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
