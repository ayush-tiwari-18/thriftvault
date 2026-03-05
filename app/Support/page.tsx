"use client";

import React from "react";
import { Phone, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SupportPage() {
  const contacts = [
    { label: "Payment & Orders", phone: "+91 7009520608" },
    { label: "Technical Issues", phone: "+91 8178308335" },
  ];

  return (
    <div className="container-page py-10 max-w-lg mx-auto text-center">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-3xl font-bold mb-2">Support</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Contact us if you face any issues with your ThriftVault order.
      </p>

      <div className="space-y-4">
        {contacts.map((c, i) => (
          <div key={i} className="p-6 border rounded-xl flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {c.label}
            </span>
            <p className="text-2xl font-mono font-bold">{c.phone}</p>
            <div className="flex gap-2 w-full mt-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2  bg-green-600 hover:bg-green-700"
                onClick={() => window.open(`https://wa.me/${c.phone.replace(/\s/g, '')}`, '_blank')}
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </Button>
              <Button 
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = `tel:${c.phone}`}
              >
                <Phone className="h-4 w-4" /> Call
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}