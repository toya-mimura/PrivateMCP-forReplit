import React from "react";

interface StatusCardProps {
  title: string;
  value: string;
  status?: "success" | "warning" | "error";
  icon: React.ReactNode;
}

export default function StatusCard({ title, value, status, icon }: StatusCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{title}</p>
          <p className="text-lg font-medium flex items-center mt-1">
            {status && (
              <span 
                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  status === "success" ? "bg-success" :
                  status === "warning" ? "bg-warning" :
                  "bg-error"
                }`}
              />
            )}
            {value}
          </p>
        </div>
        <div className={`${
          status === "success" ? "bg-green-100 dark:bg-slate-700" :
          status === "warning" ? "bg-yellow-100 dark:bg-slate-700" :
          status === "error" ? "bg-red-100 dark:bg-slate-700" :
          "bg-blue-100 dark:bg-slate-700"
        } p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
