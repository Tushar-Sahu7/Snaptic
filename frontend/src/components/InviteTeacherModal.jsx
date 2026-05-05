import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Mail,
  MessageSquare,
  Twitter,
  Check,
  Sparkles,
  Share2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";

export function InviteTeacherModal({ open, onOpenChange }) {
  const { user, generateInviteLink } = useAuth();
  const [inviteLink, setInviteLink] = useState(user?.inviteLink || "");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync with user.inviteLink when modal opens or user profile updates
  useEffect(() => {
    if (open && user?.inviteLink) {
      setInviteLink(user.inviteLink);
    }
  }, [open, user?.inviteLink]);

  // Auto-generate if missing when modal opens
  useEffect(() => {
    if (open && !inviteLink && !isRegenerating) {
      handleRegenerate();
    }
  }, [open]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newLink = await generateInviteLink();
      setInviteLink(newLink);
      if (inviteLink) {
        toast.success("Invite link regenerated");
      }
    } catch (err) {
      toast.error("Failed to generate invite link");
    } finally {
      setIsRegenerating(false);
    }
  };

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

  const handleNativeShare = async () => {
    if (!inviteLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Snaptic",
          text: "Hey! I've been using Snaptic to automate my attendance tracking. Check it out!",
          url: inviteLink,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Failed to share link");
        }
      }
    } else {
      copyToClipboard();
      toast.info("Native sharing not supported. Link copied to clipboard.");
    }
  };

  const shareOptions = [
    {
      name: "Email",
      icon: Mail,
      action: () =>
        window.open(
          `mailto:?subject=Join me on Snaptic&body=Hey! I've been using Snaptic to automate my attendance tracking. Check it out: ${inviteLink}`,
        ),
    },
    {
      name: "WhatsApp",
      icon: MessageSquare,
      action: () =>
        window.open(
          `https://wa.me/?text=Check out Snaptic, it's great for attendance: ${inviteLink}`,
        ),
    },
    {
      name: "Twitter",
      icon: Twitter,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=Automating attendance with Snaptic!&url=${inviteLink}`,
        ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 rounded-[32px] p-0 overflow-hidden border border-border/40 bg-background shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
        <div className="p-8 pt-10">
          <DialogHeader className="mb-10 space-y-4">
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-[20px] bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]">
              <Sparkles className="size-6 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-center text-foreground">
              Invite a Teacher
            </DialogTitle>
            <DialogDescription className="text-center text-balance text-[13px] font-medium leading-relaxed text-muted-foreground/60">
              Help fellow teachers reclaim their class time with biometric
              attendance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label
                  id="invite-link-label"
                  className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80"
                >
                  Invite Link
                </label>
              </div>
              <div className="group relative">
                <div className="flex h-14 items-center gap-3 rounded-2xl bg-muted/30 pl-5 pr-2 ring-1 ring-border/20 transition-all focus-within:bg-background focus-within:ring-primary/20 focus-within:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.08)] dark:focus-within:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)]">
                  <input
                    readOnly
                    value={isRegenerating ? "Generating..." : inviteLink}
                    aria-labelledby="invite-link-label"
                    className="flex-1 bg-transparent font-mono text-[11px] font-medium text-foreground/80 outline-none placeholder:text-muted-foreground/30"
                    onClick={(e) => e.target.select()}
                  />
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={copyToClipboard}
                            disabled={!inviteLink || isRegenerating}
                            aria-label={
                              copied ? "Link copied" : "Copy invite link"
                            }
                            className="h-10 w-10 rounded-xl transition-all duration-300 hover:bg-primary/5 active:scale-95"
                          >
                            {copied ? (
                              <Check className="size-4 text-primary animate-in zoom-in duration-300" />
                            ) : (
                              <Copy className="size-4 opacity-70 group-hover:opacity-100" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-[10px] font-bold uppercase tracking-wider">
                            {copied ? "Copied!" : "Copy Link"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleNativeShare}
                      disabled={!inviteLink || isRegenerating}
                      aria-label="Share invite link"
                      className="h-10 gap-2 rounded-xl px-5 text-[11px] font-bold shadow-sm transition-all active:scale-95"
                    >
                      <Share2 className="size-3.5" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-border/20" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
                  Quick Share
                </span>
                <div className="h-[1px] flex-1 bg-border/20" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {shareOptions.map((option) => (
                  <Button
                    key={option.name}
                    variant="outline"
                    onClick={option.action}
                    disabled={!inviteLink || isRegenerating}
                    aria-label={`Share via ${option.name}`}
                    className="group flex h-auto flex-col items-center gap-3 rounded-2xl border-border/40 bg-muted/5 py-6 transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.02] active:scale-[0.96]"
                  >
                    <div className="flex size-11 items-center justify-center rounded-[14px] bg-muted/40 text-foreground shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-background group-hover:shadow-xl group-hover:text-primary">
                      <option.icon className="size-4 opacity-70 transition-opacity group-hover:opacity-100" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 transition-colors group-hover:text-foreground">
                      {option.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 flex-1 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
            >
              Dismiss
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="h-12 flex-1 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(var(--primary),0.3)]"
            >
              {isRegenerating ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="size-3 animate-spin" />
                  <span>Regenerating...</span>
                </div>
              ) : (
                "Regenerate"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
