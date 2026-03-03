"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface CircuitTextProps {
    text: string
    className?: string
}

export const CircuitText: React.FC<CircuitTextProps> = ({ text, className = "" }) => {
    // We'll split the text into lines if needed, but for the marquee effect, 
    // we'll focus on a single large SVG structure.

    return (
        <div className={`relative select-none ${className}`}>
            <svg
                viewBox="0 0 800 120"
                className="w-full h-auto overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id="circuit-glow-proper" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <linearGradient id="circuit-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                </defs>

                {/* Base Outline Text */}
                <text
                    x="50%"
                    y="70%"
                    textAnchor="middle"
                    className="font-black italic uppercase tracking-widest fill-none stroke-[1.5] stroke-cyan-400"
                    style={{
                        fontSize: '60px',
                        filter: 'url(#circuit-glow-proper)',
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    {text}
                </text>

                {/* Schematic Detail Overlay */}
                <text
                    x="50%"
                    y="70%"
                    textAnchor="middle"
                    className="font-black italic uppercase tracking-widest fill-none stroke-[0.5] stroke-white opacity-40"
                    style={{
                        fontSize: '60px',
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    {text}
                </text>

                {/* Programmatic Nodes (Simplified for demonstration, ideally manually placed for best look) */}
                {/* These represent the small circles at junctions/terminals */}
                <g className="nodes-layer">
                    {/* Note: In a real production app, we would use d-paths and find corners. 
              Here we will add decorative clusters that follow the horizontal/vertical structure. */}

                    {/* Decorative lines and nodes crossing the text */}
                    <motion.path
                        d="M 100,20 L 700,20 M 100,100 L 700,100"
                        stroke="url(#circuit-grad)"
                        strokeWidth="0.5"
                        strokeDasharray="10 5"
                        animate={{ strokeDashoffset: [0, 100] }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    />

                    {/* Clustered Nodes */}
                    {[120, 240, 360, 480, 600, 720].map((x, i) => (
                        <React.Fragment key={i}>
                            <circle cx={x} cy="20" r="2.5" fill="#22d3ee" className="animate-pulse" />
                            <circle cx={x + 10} cy="100" r="2" fill="#22d3ee" />
                            <line x1={x} y1="20" x2={x} y2="40" stroke="#22d3ee" strokeWidth="0.5" />
                        </React.Fragment>
                    ))}
                </g>
            </svg>

            <style jsx>{`
        svg text {
          paint-order: stroke;
        }
      `}</style>
        </div>
    )
}
