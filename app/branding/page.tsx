"use client";

import React from "react";
import { ExperimentalLogo } from "@/components/ExperimentalLogo";
import { SocialProof } from "@/components/SocialProof";
import { LogoDescription } from "@/components/LogoDescription";
import { TopBanner } from "@/components/TopBanner";
import { 
  MoveRight, 
  Play, 
  RotateCcw, 
  Search, 
  Sparkle, 
  Palette, 
  Brush, 
  Frame, 
  History 
} from "lucide-react";

export default function BrandingPage() {
  const [logoTrigger, setLogoTrigger] = React.useState<"forward" | "reverse" | "none">("none");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "1") {
        setLogoTrigger("forward");
      } else if (e.key === "2") {
        setLogoTrigger("reverse");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center py-20 px-8 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-black/5" />
      
      <div className="w-full max-w-6xl space-y-32">
        {/* Header Section */}
        <section className="text-center space-y-4">
          <p className="font-header text-sm tracking-[0.3em] uppercase text-black/30">Visual Identity</p>
          <h1 className="font-header text-6xl text-black">Branding Guide</h1>
        </section>

        {/* Logo Section */}
        <section className="flex flex-col items-center space-y-12">
          <div className="w-full h-px bg-black/5" />
          <div className="text-center">
            <h2 className="font-header text-2xl text-black mb-2">Primary Animated Logo</h2>
            <p className="font-body text-black/40">Black monochrome variant for high-contrast branding</p>
          </div>
          
          <div className="w-full max-w-lg flex flex-col items-center gap-8 py-12">
            <ExperimentalLogo trigger={logoTrigger} color="#000000" className="" />
            
            <div className="flex gap-4">
              <button 
                onClick={() => setLogoTrigger("forward")}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-header text-sm hover:bg-black/80 transition-all active:scale-95 translate-y-0"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Animation
              </button>
              <button 
                onClick={() => setLogoTrigger("reverse")}
                className="flex items-center gap-2 px-6 py-3 border border-black/20 text-black rounded-full font-header text-sm hover:bg-black/5 transition-all active:scale-95 translate-y-0"
              >
                <RotateCcw className="w-4 h-4" />
                Reverse Play
              </button>
            </div>
          </div>
        </section>

        {/* Scroll Hint */}
        <div 
          className="flex flex-col items-center gap-6 group cursor-pointer transition-all duration-700 hover:gap-8 py-8"
          onClick={() => window.scrollBy({ top: 600, behavior: 'smooth' })}
        >
          <span className="font-body text-[10px] tracking-[0.5em] uppercase text-black opacity-30">
            Scroll to Explore
          </span>
          <div className="relative flex flex-col items-center">
            <div className="h-12 w-[1px] bg-gradient-to-b from-black to-transparent opacity-10" />
            <div className="absolute bottom-0 w-1 h-1 bg-black rounded-full group-hover:translate-y-2 transition-transform duration-500" />
          </div>
        </div>

        {/* Components Section */}
        <section className="space-y-16">
          <div className="w-full h-px bg-black/5" />
          <div className="text-center">
            <h2 className="font-header text-3xl text-black">Interface Components</h2>
            <p className="font-body text-black/40">Building blocks of the Odilon experience</p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            <div className="space-y-4">
       
              <div className="flex items-center justify-start border-b border-black/5 pb-8">
                <SocialProof />
              </div>
            </div>

             <div className="space-y-4">
             
              <div className="flex items-center justify-start border-b border-black/5 pb-8">
                <LogoDescription />
              </div>
            </div>

            <div className="space-y-4">
              <span className="font-body text-xs font-bold uppercase tracking-widest text-black/30">Primary Call to Action</span>
              <div className="flex items-center justify-start border-b border-black/5 pb-10 relative overflow-hidden h-40">
                <div className="relative group pointer-events-auto cursor-pointer">
                  {/* Decorative ambient glow */}
                  <div className="absolute -inset-4 bg-odilon-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <button className="ms-12 relative flex items-center gap-4 px-10 py-5 bg-[#EBEBEB] rounded-sm shadow-[inset_0_2px_5px_rgba(0,0,0,0.2),0_10px_20px_rgba(0,0,0,0.15)] transition-all duration-500 hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_15px_30px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 group border-t border-white/50">
                    <span className="font-header text-2xl text-odilon-heading tracking-tight">
                      Join now
                    </span>
                    <div className="relative overflow-hidden w-6 h-6">
                      <MoveRight 
                        className="w-full h-full text-odilon-heading transition-transform duration-500 group-hover:translate-x-1" 
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <span className="font-body text-xs font-bold uppercase tracking-widest text-black/30">Top Navigation Element</span>
              <div className="flex items-center justify-start border-b border-black/5 pb-8 relative overflow-hidden h-24">
                <div className="scale-110 flex justify-start">
                   <button className="font-body text-[10px] tracking-[0.2em] text-[#483434] hover:underline decoration-[#B6C7AA]/30 underline-offset-4 transition-all uppercase">
                    odilon studies concerns of honesty and integrity for AI in art
                   </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-12">
          <div className="w-full h-px bg-black/5" />
          <div className="text-center">
            <h2 className="font-header text-3xl text-black">Color Palette</h2>
            <p className="font-body text-black/40">The official Odilon brand colors</p>
          </div>
          
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
            <ColorSwatch color="#F6E6CB" name="Background" variable="--background" text="#6B4F4F" />
            <ColorSwatch color="#6B4F4F" name="Foreground" variable="--foreground" text="#F6E6CB" />
            <ColorSwatch color="#483434" name="Primary" variable="--brand-primary" text="#F6E6CB" />
            <ColorSwatch color="#E7D4B5" name="Secondary" variable="--brand-secondary" text="#483434" />
            <ColorSwatch color="#B6C7AA" name="Accent" variable="--accent" text="#483434" />
          </div>
        </section>

        {/* Iconography Section */}
        <section className="space-y-12">
          <div className="w-full h-px bg-black/5" />
          <div className="text-center">
            <h2 className="font-header text-3xl text-black">Iconography</h2>
            <p className="font-body text-black/40">Clean, geometric icons used across the interface</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
            <IconSwatch Icon={Search} name="Search" />
            <IconSwatch Icon={Sparkle} name="Analysis" />
            <IconSwatch Icon={Palette} name="Artistic" />
            <IconSwatch Icon={Brush} name="Creative" />
            <IconSwatch Icon={Frame} name="Gallery" />
            <IconSwatch Icon={History} name="Historical" />
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-16 pb-32">
          <div className="w-full h-px bg-black/5" />
          <div className="text-center">
            <h2 className="font-header text-3xl text-black">Typography</h2>
            <p className="font-body text-black/40">Our curated font selection for clarity and artfulness</p>
          </div>

          <div className="grid grid-cols-1 gap-20">
            {/* Logo Font */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start border-b border-black/5 pb-12">
              <div className="space-y-1">
                <p className="font-body text-xs font-bold uppercase tracking-widest text-black/30">Logo Font</p>
                <h3 className="font-header text-xl text-black">Gloock</h3>
              </div>
              <div className="md:col-span-2 space-y-4">
                <span className="font-logo text-7xl text-black">odilon</span>
                <p className="font-body text-black/40 max-w-md">Used exclusively for the primary brand mark. Designed to reflect the elegance and historical weight of the masterpieces we discuss.</p>
              </div>
            </div>

            {/* Header Font */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start border-b border-black/5 pb-12">
              <div className="space-y-1">
                <p className="font-body text-xs font-bold uppercase tracking-widest text-black/30">Header & Title</p>
                <h3 className="font-header text-xl text-black">Bree Serif</h3>
              </div>
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-header text-5xl text-black leading-tight">The voice of art is timeless.</h4>
                <p className="font-body text-black/40 max-w-md">Our chosen typeface for all headers, titles, and important statements. It bridges the gap between classic serifs and modern readability.</p>
              </div>
            </div>

            {/* Body Font */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="space-y-1">
                <p className="font-body text-xs font-bold uppercase tracking-widest text-black/30">Body & UI Font</p>
                <h3 className="font-header text-xl text-black">Assistant</h3>
              </div>
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <p className="font-body text-2xl text-black">A sanctuary for the art lover's soul.</p>
                  <p className="font-body text-base text-black/60 leading-relaxed max-w-xl">
                    Odilon uses Assistant for all interface elements, descriptions, and conversation bubbles. 
                    It ensures maximum accessibility and clarity while maintaining a soft, approachable character.
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-body text-xs text-black/20 uppercase font-bold tracking-widest">Weights: Light, Regular, Semi-Bold, Bold</span>
                  <span className="font-body text-xs text-red-500 font-bold tracking-widest uppercase">Rule: No Italics Permitted</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function IconSwatch({ Icon, name }: { Icon: any; name: string }) {
  return (
    <div className="space-y-3 flex flex-col items-center group">
      <div className="aspect-square w-full rounded-2xl bg-odilon-card/20 flex flex-col items-center justify-center transition-all duration-500 group-hover:bg-odilon-card/40 group-hover:scale-105 border border-black/[0.03]">
        <Icon className="w-12 h-12 text-odilon-heading" />
      </div>
      <span className="font-body text-xs font-bold uppercase tracking-widest text-black/40">{name}</span>
    </div>
  );
}

function ColorSwatch({ color, name, variable, text }: { color: string; name: string; variable: string; text: string }) {
  return (
    <div className="space-y-3 group">
      <div 
        className="aspect-square rounded-2xl shadow-sm border border-black/[0.03] transition-transform duration-500 group-hover:scale-105 flex flex-col items-center justify-center p-4 text-center"
        style={{ backgroundColor: color }}
      >
        <span className="font-header text-sm opacity-80" style={{ color: text }}>{name}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-body text-[10px] font-bold uppercase tracking-tighter text-black/60">{color}</span>
        <span className="font-body text-[9px] text-black/30">{variable}</span>
      </div>
    </div>
  );
}
