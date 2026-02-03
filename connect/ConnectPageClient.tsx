//app\dashboard\connect\ConnectPageClient.tsx

"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import {
  Plus,
  Trash2,
  BarChart3,
  GripVertical,
  ArrowLeft,
} from "lucide-react";

import {
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaLink,
} from "react-icons/fa";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { SocialLink, UpdateSocialFn } from "./types";

const supabase = getSupabaseBrowserClient();

/* ------------------------------------------------------------------ */
/* Helpers */



function detectPlatform(handle: string): SocialLink["platform"] {
  const h = handle.toLowerCase();

  if (h.includes("twitter.com") || h.includes("x.com")) return "twitter";
  if (h.includes("instagram.com")) return "instagram";
  if (h.includes("tiktok.com")) return "tiktok";
  if (h.includes("youtube.com") || h.includes("youtu.be")) return "youtube";
  if (h.includes("linktr.ee")) return "linktree";

  return "unknown";
}

function createEmptySocial(): SocialLink {
  return {
    id: crypto.randomUUID(),
    handle: "",
    enabled: true,
    platform: "unknown",
    followers: 0,
  };
}

function getSocialIcon(platform: SocialLink["platform"]) {
  switch (platform) {
    case "twitter":
      return <FaTwitter />;
    case "instagram":
      return <FaInstagram />;
    case "tiktok":
      return <FaTiktok />;
    case "youtube":
      return <FaYoutube />;
    case "linktree":
      return <FaLink />;
    default:
      return <FaLink />;
  }
}

async function parseLinktree(url: string): Promise<SocialLink[]> {
  if (!url.includes("linktr.ee")) return [];

  const baseId = crypto.randomUUID();

  return [
    {
      id: `${baseId}-tw`,
      handle: "https://twitter.com/from_linktree",
      enabled: true,
      linktree: true,
      platform: "twitter",
      followers: 1200,
    },
    {
      id: `${baseId}-ig`,
      handle: "https://instagram.com/from_linktree",
      enabled: true,
      linktree: true,
      platform: "instagram",
      followers: 980,
    },
    {
      id: `${baseId}-yt`,
      handle: "https://youtube.com/@from_linktree",
      enabled: true,
      linktree: true,
      platform: "youtube",
      followers: 4300,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* EMAIL VERIFICATION */

const EmailVerificationCard = ({
  email,
  setEmail,
  emailStatus,
  setEmailStatus,
}: {
  email: string;
  setEmail: (v: string) => void;
  emailStatus: "unverified" | "pending" | "verified";
  setEmailStatus: (v: "unverified" | "pending" | "verified") => void;
}) => {
  const [checking, setChecking] = useState(false);

  async function sendVerification() {
    if (!email) return toast.error("Enter an email first");

    const { error } = await supabase.auth.updateUser({ email });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Verification email sent");
    setEmailStatus("pending");
  }

  async function pollVerification() {
    setChecking(true);

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (user?.email_confirmed_at) {
      setEmailStatus("verified");
      toast.success("Email verified");
    } else {
      toast.info("Still not verified");
    }

    setChecking(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {emailStatus === "verified" && (
          <p className="text-green-600 text-sm font-medium">Email verified</p>
        )}

        {emailStatus === "pending" && (
          <p className="text-yellow-600 text-sm font-medium">
            Verification sent — check your inbox
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={sendVerification} disabled={!email}>
            Send Verification Email
          </Button>

          <Button variant="outline" onClick={pollVerification} disabled={checking}>
            Check Verification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/* ------------------------------------------------------------------ */
/* Sortable Row */

function SortableRow({
  social,
  index: _index,
  updateSocial,
  removeSocial,
}: {
  social: SocialLink;
  index: number;
  updateSocial: UpdateSocialFn;
  removeSocial: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: social.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove social?</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={async () => {
                await supabase.from("user_socials").delete().eq("id", social.id);
                removeSocial(social.id);
                toast.success("Social removed");
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.tr ref={setNodeRef} style={style}>
        <TableCell>
          <button {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4" />
          </button>
        </TableCell>

        <TableCell className="flex items-center gap-2">
          {getSocialIcon(social.platform)}
          <Input
            placeholder="@username or link"
            value={social.handle}
            onChange={(e) =>
              updateSocial(social.id, "handle", e.target.value)
            }
          />
        </TableCell>

        <TableCell>
          <Switch
            checked={social.enabled}
            onCheckedChange={(v) => updateSocial(social.id, "enabled", v)}
          />
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">
              {social.followers ?? 0}
            </span>
          </div>
        </TableCell>

        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </motion.tr>
    </>
  );
}/* ------------------------------------------------------------------ */
/* Main Component */

export default function ConnectPageClient({
  initialSocials,
  initialEmail,
  initialEmailStatus,
}: {
  initialSocials: SocialLink[];
  initialEmail: string;
  initialEmailStatus: "unverified" | "pending" | "verified";
}) {
  const router = useRouter();

  const [socials, setSocials] = useState<SocialLink[]>(initialSocials);
  const [email, setEmail] = useState(initialEmail);
  const [emailStatus, setEmailStatus] =
    useState<"unverified" | "pending" | "verified">(initialEmailStatus);

  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);

  /* -------------------------------------------------------------- */
  /* Update a single social field */

  const updateSocial: UpdateSocialFn = (id, key, value) => {
    setSocials((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  /* -------------------------------------------------------------- */
  /* Add new social */

  async function addSocial() {
    setAdding(true);

    const newSocial = createEmptySocial();

    const { data, error } = await supabase
      .from("user_socials")
      .insert({
        id: newSocial.id,
        handle: "",
        enabled: true,
        platform: "unknown",
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      setAdding(false);
      return;
    }

    setSocials((prev) => [...prev, newSocial]);
    toast.success("Social added");
    setAdding(false);
  }

  /* -------------------------------------------------------------- */
  /* Remove social */

  function removeSocial(id: string) {
    setSocials((prev) => prev.filter((s) => s.id !== id));
  }

  /* -------------------------------------------------------------- */
  /* Save all socials */

  async function saveAll() {
    startTransition(async () => {
      const payload = socials.map((s) => ({
        id: s.id,
        handle: s.handle,
        enabled: s.enabled,
        platform: detectPlatform(s.handle),
      }));

      const { error } = await supabase.from("user_socials").upsert(payload);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Saved");
      router.refresh();
    });
  }

  /* -------------------------------------------------------------- */
  /* Drag & Drop Reordering */

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSocials((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  /* -------------------------------------------------------------- */
  /* Linktree Auto‑Parse */

  async function handleLinktreeImport(url: string) {
    const parsed = await parseLinktree(url);
    if (parsed.length === 0) {
      toast.error("Not a valid Linktree URL");
      return;
    }

    setSocials((prev) => [...prev, ...parsed]);
    toast.success("Imported from Linktree");
  }

  /* -------------------------------------------------------------- */
  /* Render */

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Email Verification */}
      <EmailVerificationCard
        email={email}
        setEmail={setEmail}
        emailStatus={emailStatus}
        setEmailStatus={setEmailStatus}
      />

      {/* Socials Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Socials</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste Linktree URL"
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await handleLinktreeImport((e.target as HTMLInputElement).value);
                }
              }}
            />
            <Button
              onClick={() => {
                const el = document.querySelector<HTMLInputElement>(
                  "input[placeholder='Paste Linktree URL']"
                );
                if (el) handleLinktreeImport(el.value);
              }}
            >
              Import
            </Button>
          </div>

          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={socials.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Handle</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {socials.map((social, index) => (
                    <SortableRow
                      key={social.id}
                      social={social}
                      index={index}
                      updateSocial={updateSocial}
                      removeSocial={removeSocial}
                    />
                  ))}
                </TableBody>
              </Table>
            </SortableContext>
          </DndContext>

          <Button onClick={addSocial} disabled={adding}>
            <Plus className="h-4 w-4 mr-2" />
            Add Social
          </Button>

          <Button
            onClick={saveAll}
            disabled={isPending}
            className="w-full mt-4"
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}