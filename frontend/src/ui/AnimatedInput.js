import React from "react";

export default function AnimatedInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  icon: Icon,
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[#111111] uppercase tracking-[0.12em] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8D83]">
            {typeof Icon === "string" ? (
              <span>{Icon}</span>
            ) : (
              <Icon className="w-4 h-4" />
            )}
          </span>
        )}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full bg-white border ${
            error ? "border-red-400" : "border-[#EAE8E2]"
          } focus:border-[#111111] text-[#111111] placeholder-[#A8A59C] text-sm px-4 py-3 transition-colors duration-200 disabled:bg-[#F8F7F4] disabled:text-[#8A8D83] ${
            Icon ? "pl-11" : ""
          }`}
        />
      </div>
      {error && (
        <p className="text-red-600 text-xs mt-1.5 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
