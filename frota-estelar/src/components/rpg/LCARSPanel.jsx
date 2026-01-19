import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";

export default function LCARSPanel({ 
  children, 
  title, 
  color = "blue", 
  className,
  animate = true 
}) {
  const colors = {
    blue: "from-cyan-500 to-blue-600",
    orange: "from-amber-400 to-orange-500",
    red: "from-red-400 to-red-600",
    purple: "from-purple-400 to-purple-600",
    green: "from-emerald-400 to-teal-500"
  };

  const borderColors = {
    blue: "border-cyan-400",
    orange: "border-amber-400",
    red: "border-red-400",
    purple: "border-purple-400",
    green: "border-emerald-400"
  };

  const glowColors = {
    blue: "shadow-cyan-500/20",
    orange: "shadow-amber-500/20",
    red: "shadow-red-500/20",
    purple: "shadow-purple-500/20",
    green: "shadow-emerald-500/20"
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative bg-slate-900/90 backdrop-blur-xl rounded-2xl overflow-hidden",
        `border ${borderColors[color]} border-opacity-30`,
        `shadow-xl ${glowColors[color]}`,
        className
      )}
    >
      {/* LCARS Top Bar */}
      <div className="flex items-stretch h-12">
        <div className={cn(
          "w-24 bg-gradient-to-r rounded-br-3xl",
          colors[color]
        )} />
        <div className="flex-1 flex items-center px-4">
          <div className={cn(
            "h-2 flex-1 bg-gradient-to-r rounded-full opacity-60",
            colors[color]
          )} />
          {title && (
            <span className="ml-4 text-sm font-mono tracking-widest text-slate-300 uppercase">
              {title}
            </span>
          )}
        </div>
        <div className={cn(
          "w-16 bg-gradient-to-l rounded-bl-3xl",
          colors[color]
        )} />
      </div>
      
      {/* Content */}
      <div className="p-6">
        {children}
      </div>

      {/* LCARS Bottom Bar */}
      <div className="flex items-stretch h-8">
        <div className={cn(
          "w-16 bg-gradient-to-r rounded-tr-3xl",
          colors[color]
        )} />
        <div className="flex-1 flex items-center px-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className={cn(
                "h-1.5 rounded-full",
                colors[color],
                i % 2 === 0 ? "w-8" : "w-4",
                "opacity-40"
              )}
            />
          ))}
        </div>
        <div className={cn(
          "w-24 bg-gradient-to-l rounded-tl-3xl",
          colors[color]
        )} />
      </div>
    </motion.div>
  );
}
