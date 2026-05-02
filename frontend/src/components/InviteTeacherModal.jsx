import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, MessageSquare, Twitter, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function InviteTeacherModal({ open, onOpenChange, inviteLink }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareOptions = [
    {
      name: "Email",
      icon: Mail,
      action: () => window.open(`mailto:?subject=Join me on Snaptic&body=Hey! I've been using Snaptic to automate my attendance tracking. Check it out: ${inviteLink}`),
    },
    {
      name: "WhatsApp",
      icon: MessageSquare,
      action: () => window.open(`https://wa.me/?text=Check out Snaptic, it's great for attendance: ${inviteLink}`),
    },
    {
      name: "Twitter",
      icon: Twitter,
      action: () => window.open(`https://twitter.com/intent/tweet?text=Automating attendance with Snaptic!&url=${inviteLink}`),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 rounded-[32px] p-0 overflow-hidden border border-border/40 bg-background shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
        <div className="p-8 pt-10">
          <DialogHeader className="mb-10 space-y-4">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-muted/50 text-foreground/40">
              <Sparkles className="size-5" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-center text-foreground">
              Invite a Colleague
            </DialogTitle>
            <DialogDescription className="text-center text-balance text-[13px] font-medium leading-relaxed text-muted-foreground/60">
              Help fellow teachers reclaim their class time with biometric attendance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40">
                  Invite Link
                </label>
              </div>
              <div className="group relative">
                <div className="flex h-14 items-center gap-3 rounded-2xl bg-muted/30 px-4 ring-1 ring-border/20 transition-all focus-within:bg-background focus-within:ring-foreground/10">
                  <input
                    readOnly
                    value={inviteLink || "Generating..."}
                    className="flex-1 bg-transparent font-mono text-[11px] font-medium text-foreground/70 outline-none"
                    onClick={(e) => e.target.select()}
                  />
                  <Button
                    size="sm"
                    onClick={copyToClipboard}
                    className={cn(
                      "h-9 min-w-[80px] rounded-xl px-4 text-[11px] font-bold transition-all duration-300",
                      copied 
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_8px_16px_-4px_rgba(16,185,129,0.3)]" 
                        : "bg-foreground text-background hover:bg-foreground/90 shadow-sm"
                    )}
                  >
                    {copied ? <Check className="mr-2 size-3" /> : <Copy className="mr-2 size-3" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-border/20" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/20">
                  Quick Share
                </span>
                <div className="h-[1px] flex-1 bg-border/20" />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-transparent p-4 transition-all duration-300 hover:bg-muted/40 active:scale-95"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted/40 text-foreground transition-all duration-300 group-hover:scale-110 group-hover:bg-background group-hover:shadow-md">
                      <option.icon className="size-4 opacity-60 transition-opacity group-hover:opacity-100" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 transition-colors group-hover:text-foreground">
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="h-10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 hover:bg-transparent hover:text-foreground transition-colors"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
