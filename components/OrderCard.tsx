"use client";

import React, { useState } from "react";
import {
  Package,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  User,
  Phone,
  Mail,
  CreditCard,
  Hash,
  Store,
  ChevronDown,
  ChevronUp,
  XCircle, // Added for failed/cancelled states
  AlertCircle
} from "lucide-react";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface OrderCardProps {
  order: Order;
}

const getStatusDetails = (status: Order["status"]) => {
  switch (status) {
    case "paid":
      return {
        color: "bg-green-500/10 text-green-600",
        icon: <CheckCircle2 className="h-4 w-4" />,
      };
    case "shipped":
      return {
        color: "bg-blue-500/10 text-blue-600",
        icon: <Truck className="h-4 w-4" />,
      };
    case "delivered":
      return {
        color: "bg-emerald-500/10 text-emerald-600",
        icon: <Package className="h-4 w-4" />,
      };
    case "failed":
    case "cancelled":
      return {
        color: "bg-red-500/10 text-red-600",
        icon: <XCircle className="h-4 w-4" />,
      };
    case "pending":
      return {
        color: "bg-amber-500/10 text-amber-600",
        icon: <Clock className="h-4 w-4" />,
      };
    default:
      return {
        color: "bg-slate-500/10 text-slate-600",
        icon: <AlertCircle className="h-4 w-4" />,
      };
  }
};

export default function OrderCard({ order }: OrderCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { color, icon } = getStatusDetails(order.status);

  return (
    <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md mb-4">
      {/* Header Section - Always Visible */}
      <div
        className="flex flex-wrap items-center justify-between border-b bg-muted/30 px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-bold text-foreground">
                Order #{order.id.slice(-8).toUpperCase()}
              </h3>
              <Separator orientation="vertical" className="h-4" />
              <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Store className="h-3.5 w-3.5" />
                {order.storeName || "ThriftVault Store"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3" />
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Amount
            </span>
            <span className="font-bold text-foreground">
              Rs.{order.totalAmount.toFixed(2)}
            </span>
          </div>
          <Badge
            variant="secondary"
            className={`${color} border-none font-semibold px-3 py-1`}
          >
            {order.status.toUpperCase()}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
          >
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Information Section */}
            <div className="space-y-6">
              <section>
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  <User className="h-3.5 w-3.5" /> Customer Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-foreground">
                    {order.customerName}
                  </p>
                  <div className="space-y-1 text-muted-foreground">
                    <p className="flex items-center gap-2 italic">
                      <Mail className="h-3.5 w-3.5" /> {order.customerEmail}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> {order.customerPhone}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  <MapPin className="h-3.5 w-3.5" /> Shipping Address
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground bg-muted/40 p-4 rounded-md border border-solid">
                  {order.shippingAddress}
                </p>
              </section>
            </div>

            {/* Itemized Inventory & Financial Section */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  <Hash className="h-3.5 w-3.5" /> Order Contents
                </h4>

                <div className="rounded-lg border bg-background overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b text-left text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-muted/5 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {item.product.name}
                          </td>
                          <td className="px-4 py-3 text-center text-foreground">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            Rs.{item.product.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">
                            Rs.{(item.product.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mt-6 space-y-3 bg-muted/20 p-4 rounded-lg border border-muted">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5" /> MerchantOrderId:
                    </span>
                    <span className="font-mono text-muted-foreground select-all">
                      {order.merchantOrderId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5" /> PhonePe TransactionId:
                    </span>
                    <span className="font-mono text-muted-foreground select-all">
                      {order.paymentIntentId || "Not generated"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold block">
                      Total Amount Paid
                    </span>
                    <span className="text-[10px] text-muted-foreground italic">
                      Tax and shipping included
                    </span>
                  </div>
                  <span className="text-3xl font-black text-primary tracking-tighter">
                    Rs.{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}