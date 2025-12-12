"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        `
        flex items-center gap-2 has-disabled:opacity-50
        
        /* RESPONSIVE GAP */
        sm:gap-3
        md:gap-4
        lg:gap-5
      `,
        containerClassName
      )}
      className={cn(
        `
        disabled:cursor-not-allowed

        /* RESPONSIVE WIDTH FOR INPUT */
        text-base
        sm:text-lg
        md:text-xl
      `,
        className
      )}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        `
        flex items-center
        
        /* RESPONSIVE SPACING */
        gap-2
        sm:gap-3
        md:gap-4
        lg:gap-5
      `,
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        `
        border-input relative flex items-center justify-center border-y border-r 
        text-sm shadow-xs transition-all outline-none 
        first:rounded-l-md first:border-l last:rounded-r-md 
        data-[active=true]:border-ring data-[active=true]:ring-ring/50
        data-[active=true]:z-10 data-[active=true]:ring-[3px]

        /* RESPONSIVE SIZES */
        h-10 w-10          /* base mobile size */
        sm:h-12 sm:w-12    /* tablet */
        md:h-14 md:w-14    /* medium screens */
        lg:h-16 lg:w-16    /* large screens */

        /* RESPONSIVE FONT */
        text-base
        sm:text-lg
        md:text-xl
        lg:text-2xl
      `,
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="
            animate-caret-blink bg-foreground h-4 w-px duration-1000
            
            /* RESPONSIVE HEIGHT */
            sm:h-5
            md:h-6
            lg:h-7
          " />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      role="separator"
      className="
        flex items-center justify-center
        
        /* RESPONSIVE ICON SIZE */
        [&>svg]:size-3
        sm:[&>svg]:size-4
        md:[&>svg]:size-5
        lg:[&>svg]:size-6
      "
      {...props}
    >
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
