'use client'

import Link from 'next/link'
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-transparent text-gray-400 py-16 px-4 relative z-20">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* About Column */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 tracking-wider">ABOUT</h3>
                        <ul className="space-y-4">
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Contact Us</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Press</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Project Information</Link></li>
                        </ul>
                    </div>

                    {/* Services Column */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 tracking-wider">SERVICES</h3>
                        <ul className="space-y-4">
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Bug Tracking</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">AI Classification</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Duplicate Detection</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Team Collaboration</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Progress Insights</Link></li>
                        </ul>
                    </div>

                    {/* Support Column */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 tracking-wider">SUPPORT</h3>
                        <ul className="space-y-4">
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Security</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Contact Us Column */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 tracking-wider">CONTACT US</h3>
                        <div className="space-y-6 text-sm">
                            <div>
                                <p className="text-white font-semibold mb-1">Mail Us:</p>
                                <a href="mailto:bugmind.ai@gmail.com" className="hover:text-cyan-400 transition-colors">bugmind.ai@gmail.com</a>
                            </div>
                            <div>
                                <p className="text-white font-semibold mb-1">Registered Office Address:</p>
                                <p className="leading-relaxed">
                                    BugMind Platform Limited,<br />
                                    No. 42, Tech Park East,<br />
                                    Innovation District,<br />
                                    Chennai - 600001,<br />
                                    Tamil Nadu, India.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm">Follow Us:</span>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-cyan-400 transition-all">
                                <Facebook size={18} />
                            </Link>
                            <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-cyan-400 transition-all">
                                <Instagram size={18} />
                            </Link>
                            <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-cyan-400 transition-all">
                                <Youtube size={18} />
                            </Link>
                            <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-cyan-400 transition-all">
                                <Twitter size={18} />
                            </Link>
                        </div>
                    </div>

                    <p className="text-sm">
                        © 2026 BugMind. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
