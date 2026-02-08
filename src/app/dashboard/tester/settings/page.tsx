'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Settings, User, Bell, Shield, Lock } from 'lucide-react'

export default function SettingsPage() {
    return (
        <DashboardLayout role="tester">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
                    <p className="text-gray-500 font-medium">Manage your account preferences and notification settings.</p>
                </div>

                <div className="max-w-2xl space-y-6">
                    <section className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Full Name</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium border border-gray-100">
                                        Tester User
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-500 uppercase">Role</label>
                                    <div className="px-4 py-3 bg-blue-50 rounded-xl text-blue-700 font-bold border border-blue-100">
                                        QA Tester
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="w-5 h-5 text-amber-600" />
                            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                        </div>
                        <p className="text-gray-500 italic pb-2">Notification preferences coming soon.</p>
                    </section>

                    <section className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-xl font-bold text-gray-900">Security</h2>
                        </div>
                        <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
                            Change Password
                        </button>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    )
}
