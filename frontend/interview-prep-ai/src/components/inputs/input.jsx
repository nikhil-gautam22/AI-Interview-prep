import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({
  value,
  onChange,
  label,
  placeholder,
  type = "text",
  helperText,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4">
      {/* Label */}
      <label className="text-[13px] text-slate-800">{label}</label>

      {/* Input Box */}
      <div className="input-box flex items-center gap-2">
        <input
          type={inputType}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none"
          value={value}
          onChange={onChange}
        />

        {/* Password Toggle */}
        {type === "password" && (
          showPassword ? (
            <FaRegEye
              size={22}
              className="text-primary cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <FaRegEyeSlash
              size={22}
              className="text-slate-400 cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className="text-[11px] text-slate-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
