"use client"
import { useState } from "react"
import IShortlisted from "./IShortlisted"

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-center gap-12 border-b pb-4 mb-6">
        <h2 className="text-[#7D0A0A] font-bold text-lg">Shortlisted</h2>
      </div>

      {/* ✅ Only show IShortlisted */}
      <IShortlisted />
    </div>
  )
}
