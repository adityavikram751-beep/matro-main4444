"use client"
import { useState } from "react"
import IShortlisted from "./IShortlisted"

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 w-full">

      {/* PAGE HEADER */}
      <div
        className="
          flex justify-center 
          gap-6 sm:gap-12 
          border-b pb-4 mb-6 
          w-full text-center
        "
      >
        <h2 className="text-[#7D0A0A] font-bold text-lg sm:text-xl">
          Shortlisted
        </h2>
      </div>

      {/* CONTENT */}
      <div className="w-full">
        <IShortlisted />
      </div>

    </div>
  )
}
