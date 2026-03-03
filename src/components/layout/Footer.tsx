'use client'

import Link from 'next/link'
import { Facebook, Instagram, Youtube, Twitter, Bug } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 text-gray-500 py-16 px-4 relative z-20">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Bug className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-gray-900 italic">BUGMIND</span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs font-medium">
                            Next-generation bug tracking platform powered by artificial intelligence. Ship faster, track smarter.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink icon={<Facebook size={18} />} />
                            <SocialLink icon={<Instagram size={18} />} />
                            <SocialLink icon={<Youtube size={18} />} />
                            <SocialLink icon={<Twitter size={18} />} />
                        </div>
                    </div>

                    {/* Solutions Column */}
                    <div>
                        <h3 className="text-gray-900 font-bold text-sm mb-6 uppercase tracking-widest">Platform</h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><FooterLink label="Bug Tracking" /></li>
                            <li><FooterLink label="AI Classification" /></li>
                            <li><FooterLink label="Team Dashboard" /></li>
                            <li><FooterLink label="Insight Reports" /></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h3 className="text-gray-900 font-bold text-sm mb-6 uppercase tracking-widest">Resources</h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><FooterLink label="Documentation" /></li>
                            <li><FooterLink label="API Reference" /></li>
                            <li><FooterLink label="Community" /></li>
                            <li><FooterLink label="Security" /></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-gray-900 font-bold text-sm mb-6 uppercase tracking-widest">Connect</h3>
                        <div className="space-y-4 text-sm font-medium">
                            <p>Support: <a href="mailto:support@bugmind.ai" className="text-primary hover:underline">support@bugmind.ai</a></p>
                            <p>BugMind Platform Ltd.<br />Innovation District, TN IN</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest">
                    <p>© 2026 BugMind. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterLink({ label }: { label: string }) {
    return (
        <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
            <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all"></span>
            {label}
        </Link>
    )
}

function SocialLink({ icon }: { icon: React.ReactNode }) {
    return (
        <Link href="#" className="w-10 h-10 border border-gray-100 rounded-xl flex items-center justify-center hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all">
            {icon}
        </Link>
    )
}
