import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Check, MessageCircle, Mail, Share2, X } from "lucide-react";
import { toast } from "sonner";

export function InviteTeacherModal({ open, onOpenChange, inviteLink }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareData = {
    title: "Join Snaptic",
    text: "Join me on Snaptic! Use this invite link to manage your classes and automate attendance:",
    url: inviteLink,
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "text-emerald-500 hover:bg-emerald-500/10",
      href: `https://wa.me/?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`,
    },
    {
      name: "X (Twitter)",
      icon: X,
      color: "text-sky-500 hover:bg-sky-500/10",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "text-rose-500 hover:bg-rose-500/10",
      href: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + "\n\n" + shareData.url)}`,
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Invite a Colleague</DialogTitle>
          <DialogDescription>
            Share this link with other teachers to invite them to Snaptic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 w-full max-w-full overflow-hidden">
          <InputGroup className="bg-secondary/30 border-none h-11 min-w-0 w-full overflow-hidden">
            <div className="flex-1 min-w-0 h-full flex items-center px-3 overflow-hidden">
              <span className="truncate text-sm font-medium text-muted-foreground select-all w-full block">
                {inviteLink}
              </span>
            </div>
            <InputGroupAddon align="inline-end" className="p-0 pr-1">
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0 hover:bg-background/50 transition-colors"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </InputGroupAddon>
          </InputGroup>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Share via
            </span>
            <div className="flex items-center gap-2">
              {shareLinks.map((link) => (
                <Tooltip key={link.name}>
                  <TooltipTrigger asChild>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-10 flex-1 items-center justify-center rounded-lg border bg-card transition-all ${link.color}`}
                    >
                      <link.icon className="size-5" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{link.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {navigator.share && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 grow"
                      onClick={handleNativeShare}
                    >
                      <Share2 className="size-4 mr-2" />
                      More
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Share via system</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            variant="secondary" 
            className="w-full h-11 rounded-xl font-semibold shadow-sm active:scale-[0.98] transition-all"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
