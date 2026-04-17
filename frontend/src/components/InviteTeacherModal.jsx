import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Colleague</DialogTitle>
          <DialogDescription>
            Share this link with other teachers to invite them to Snaptic.
          </DialogDescription>
        </DialogHeader>

        <div>
          <InputGroup>
            <div>
              <span>
                {inviteLink}
              </span>
            </div>
            <InputGroupAddon align="inline-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check />
                ) : (
                  <Copy />
                )}
              </Button>
            </InputGroupAddon>
          </InputGroup>

          <div>
            <span>
              Share via
            </span>
            <div>
              {shareLinks.map((link) => (
                <Tooltip key={link.name}>
                  <TooltipTrigger asChild>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <link.icon />
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
                      onClick={handleNativeShare}
                    >
                      <Share2 />
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

        <div>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
