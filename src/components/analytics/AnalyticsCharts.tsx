'use client'

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts'

interface ChartProps {
    data: any[]
    height?: number
}

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export function BugDistributionPie({ data, height = 300 }: ChartProps) {
    return (
        <div style={{ width: '100%', height }} className="animate-in fade-in duration-700">
            <ResponsiveContainer>
                <PieChart>
                    <defs>
                        {data.map((entry, index) => (
                            <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.5} />
                            </linearGradient>
                        ))}
                    </defs>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="count"
                        nameKey="category"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '1.5rem',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            padding: '12px 16px',
                            fontWeight: 'bold'
                        }}
                    />
                    <Legend iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

export function SeverityBarChart({ data, height = 300 }: ChartProps) {
    const severityColors: Record<string, string> = {
        critical: '#f43f5e',
        high: '#f59e0b',
        medium: '#8b5cf6',
        low: '#10b981'
    }

    return (
        <div style={{ width: '100%', height }} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ResponsiveContainer>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="severity"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc', radius: 12 }}
                        contentStyle={{
                            borderRadius: '1.5rem',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            padding: '12px 16px'
                        }}
                    />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={severityColors[entry.severity] || '#6366f1'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export function PerformanceTrendLine({ data, height = 300 }: ChartProps) {
    return (
        <div style={{ width: '100%', height }} className="animate-in fade-in slide-in-from-left-4 duration-700">
            <ResponsiveContainer>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '1.5rem',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            padding: '12px 16px'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="avgTime"
                        stroke="#6366f1"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorTrend)"
                        dot={{ r: 4, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export function WorkloadRadar({ data, height = 300 }: ChartProps) {
    return (
        <div style={{ width: '100%', height }} className="animate-in fade-in slide-in-from-right-4 duration-700">
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                        width={80}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }}
                        contentStyle={{
                            borderRadius: '1.25rem',
                            border: 'none',
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                            padding: '12px 16px'
                        }}
                    />
                    <Bar dataKey="bugs" fill="#38bdf8" radius={[0, 12, 12, 0]} barSize={16} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
