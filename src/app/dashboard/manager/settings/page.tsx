'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Settings, User, Bell, Shield, TrendingUp, Users } from 'lucide-react'

export default function ManagerSettingsPage() {
    return (
        <DashboardLayout role="manager">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manager Settings</h1>
                    <p className="text-gray-500 font-medium">Configure team workflows and platform-wide AI parameters.</p>
                </div>

                <div className="max-w-2xl space-y-6">
                    <section className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">Admin Profile</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Full Name</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium border border-gray-100">
                                        Project Manager
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Authority</label>
                                    <div className="px-4 py-3 bg-purple-50 rounded-xl text-purple-700 font-bold border border-purple-100 flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Full Access
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-xl font-bold text-gray-900">AI Thresholds</h2>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">Adjust the confidence score required for automatic bug classification.</p>
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 font-medium">
                            Current Threshold: 0.85 (Cosine Similarity)
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    )
}
