"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaSnapchatGhost,
  FaFacebook,
} from "react-icons/fa";

export default function MonetizationPage() {
  return (
    <section className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-12">

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold">Monetization Requirements</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every platform has different rules. Here’s everything you need to know to get monetized across YouTube, TikTok, Instagram, Snapchat, and Facebook.
          </p>
        </div>

        <Tabs defaultValue="youtube-long" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <TabsTrigger value="youtube-long">
              <FaYoutube className="mr-2" /> YouTube Long
            </TabsTrigger>
            <TabsTrigger value="youtube-shorts">
              <FaYoutube className="mr-2" /> Shorts
            </TabsTrigger>
            <TabsTrigger value="tiktok">
              <FaTiktok className="mr-2" /> TikTok
            </TabsTrigger>
            <TabsTrigger value="instagram">
              <FaInstagram className="mr-2" /> Instagram
            </TabsTrigger>
            <TabsTrigger value="snapchat">
              <FaSnapchatGhost className="mr-2" /> Snapchat
            </TabsTrigger>
            <TabsTrigger value="facebook">
              <FaFacebook className="mr-2" /> Facebook
            </TabsTrigger>
          </TabsList>

          {/* -------------------- YOUTUBE LONG FORM -------------------- */}
          <TabsContent value="youtube-long">
            <Card className="p-6 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <FaYoutube className="text-red-500" /> YouTube Long‑Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <Section title="Monetization Requirements">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>4,000 watch hours in the last 12 months</li>
                    <li>1,000 subscribers</li>
                    <li>Original content</li>
                    <li>Must be in a supported country</li>
                  </ul>
                </Section>

                <Section title="Average RPM">
                  <p className="text-lg font-semibold">$2.00 – $100.00 per 1,000 views</p>
                  <p className="text-muted-foreground">
                    Depends heavily on niche, audience age, location, and video length.
                  </p>
                </Section>

                <Section title="Payment Schedule">
                  <p>21st–26th of each month, $100 minimum balance</p>
                </Section>

              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------- YOUTUBE SHORTS -------------------- */}
          <TabsContent value="youtube-shorts">
            <Card className="p-6 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <FaYoutube className="text-red-500" /> YouTube Shorts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <Section title="Monetization Requirements">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>10 million engaged Shorts views in 90 days</li>
                    <li>1,000 subscribers</li>
                    <li>Original content</li>
                  </ul>
                </Section>

                <Section title="Average RPM">
                  <p className="text-lg font-semibold">$0.10 – $0.25 per 1,000 engaged views</p>
                </Section>

                <Section title="What Affects RPM">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Audience location</li>
                    <li>Season (Q4 pays more)</li>
                  </ul>
                </Section>

                <Section title="Payment Schedule">
                  <p>21st–26th of each month, $100 minimum balance</p>
                </Section>

              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------- TIKTOK -------------------- */}
          <TabsContent value="tiktok">
            <Card className="p-6 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <FaTiktok /> TikTok Creator Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <Section title="Monetization Requirements">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>10,000 followers</li>
                    <li>100,000 valid video views in last 30 days</li>
                    <li>Videos must be 1 minute+</li>
                    <li>Original content</li>
                    <li>Supported countries: US, UK, Germany, France, Japan, South Korea, Brazil</li>
                  </ul>
                </Section>

                <Section title="Average RPM">
                  <p className="text-lg font-semibold">$0.10 – $1.00 per 1,000 qualified views</p>
                </Section>

                <Section title="Payment Schedule">
                  <p>15th of each month, $10 minimum</p>
                </Section>

              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------- INSTAGRAM -------------------- */}
          <TabsContent value="instagram">
            <Card className="p-6 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <FaInstagram className="text-pink-500" /> Instagram Bonuses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <Section title="Monetization Requirements">
                  <p>Invite‑only. Appears under:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Profile → Professional Dashboard → Monetization → Bonuses</li>
                  </ul>
                </Section>

                <Section title="Average RPM">
                  <p className="text-lg font-semibold">~$0.05 per 1,000 views</p>
                </Section>

                <Section title="Payment Schedule">
                  <p>7th and 21st of each month</p>
                </Section>

              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------- SNAPCHAT -------------------- */}
          <TabsContent value="snapchat">
            <Card className="p-6 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <FaSnapchatGhost className="text-yellow-400" /> Snapchat Stories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <Section title="Monetization Requirements">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Must be a Snapchat Star</li>
                    <li>50,000 followers recommended</li>
                    <li>Approval is random after Star status</li>
                  </ul>
                </Section>

                <Section title="Average RPM">
                  <p className="text-lg font-semibold">$0.05 – $0.25 per 1,000 Story views</p>
                  <p className="text-muted-foreground">Spotlights pay ~$.01 RPM</p>
                </Section>

                <Section title="Payment Schedule">
                  <p>Crystals pending 14 days, then cash‑out</p>
                </Section>

              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------- FACEBOOK -------------------- */}
          <TabsContent value="facebook">
            <Card className="p-6 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <FaFacebook className="text-blue-600" /> Facebook In‑Stream Ads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <Section title="Monetization Requirements">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Facebook Public Page</li>
                    <li>~10,000 followers recommended</li>
                    <li>Manual approval required</li>
                  </ul>
                </Section>

                <Section title="Average RPM">
                  <p className="text-lg font-semibold">$0.10 – $1.00 per 1,000 views</p>
                </Section>

                <Section title="Payment Schedule">
                  <p>Varies — depends on region</p>
                </Section>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">{title}</h3>
      <Separator />
      <div>{children}</div>
    </div>
  );
}