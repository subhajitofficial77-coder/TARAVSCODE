"use client";
import React from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';

function NavItem({ label, href = '#', active = false }: { label: string; href?: string; active?: boolean }) {
  return (
    <Link href={href} className={`px-3 py-1 rounded ${active ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}>
      {label}
    </Link>
  );
}

export default function DashboardHeader() {
  return (
    <nav className="container mx-auto flex items-center justify-between px-4 py-4 mb-6 relative z-20">
      <div className="flex items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-[#2ECC71]">
          <span className="font-bold text-black">T</span>
        </div>
        <span className="ml-2 text-xl font-bold text-white header-text-shadow">TARA</span>
      </div>

      <div className="hidden md:flex items-center space-x-6">
        <NavItem label="Dashboard" href="/dashboard" active />
        <NavItem label="About" href="/about" />
        <NavItem label="Conversation with TARA" href="/conversation" />
        <NavItem label="Creative Studio" href="/creative-studio" />
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggle />
      </div>
    </nav>
  );
}
