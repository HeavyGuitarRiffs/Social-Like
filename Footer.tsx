"use client";

import React from "react";
import Link from "next/link";
import {
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaReddit,
  FaSlack,
  FaProductHunt,
  FaMicrosoft,
} from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full border-t border-border mt-16">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: copyright + feedback */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Social Like. All rights reserved.
          </p>

          <Link
            href="/feedback"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Feedback
          </Link>
        </div>

        {/* Right: social icons */}
        <div className="flex items-center gap-6">
          <SocialLink
            href="https://x.com/taitaotendo"
            label="X"
            icon={<FaTwitter size={20} />}
          />

          <SocialLink
            href="https://instagram.com/eonkatsu"
            label="Instagram"
            icon={<FaInstagram size={20} />}
          />

          <SocialLink
            href="https://youtube.com/yourchannel"
            label="YouTube"
            icon={<FaYoutube size={20} />}
          />

          <SocialLink
            href="https://www.reddit.com/u/MotoAndoNeo/s/PfRp5TewmX"
            label="Reddit"
            icon={<FaReddit size={20} />}
          />

          <SocialLink
            href="https://join.slack.com/t/softwareasasandwich/shared_invite/zt-3opytsgbm-H9srrHPRUPq6JiChU7iDhg"
            label="Slack"
            icon={<FaSlack size={20} />}
          />

          <SocialLink
            href="https://teams.live.com/l/invite/FEA-zQozd8RCn3VwwI?v=g1"
            label="Microsoft Teams"
            icon={<FaMicrosoft size={20} />}
          />

          <SocialLink
            href="https://www.producthunt.com/@smoothforehead"
            label="Product Hunt"
            icon={<FaProductHunt size={20} />}
          />
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="
        group
        text-muted-foreground
        transition-all
        duration-200
        hover:text-foreground
        hover:-translate-y-0.5
      "
    >
      <span
        className="
          flex items-center justify-center
          rounded-full
          p-2
          group-hover:bg-accent
          transition-colors
          duration-200
        "
      >
        {icon}
      </span>
    </Link>
  );
}
