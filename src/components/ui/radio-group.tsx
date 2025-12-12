"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

// MAIN RADIO GROUP WRAPPER
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn(
        `
          grid gap-3                /* spacing between options */
          sm:gap-4                 /* slightly bigger on tablet */
          md:gap-5                 /* more space on larger screens */
        `,
        className
      )}
      {...props}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

// RADIO ITEM
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        `
          aspect-square 
          h-4 w-4                      /* base size */
          sm:h-5 sm:w-5                /* tablet */
          md:h-6 md:w-6                /* desktop */

          rounded-full border 
          border-primary 
          text-primary 
          transition-all

          ring-offset-background 
          focus:outline-none 
          focus-visible:ring-2 
          focus-visible:ring-ring 
          focus-visible:ring-offset-2 

          disabled:cursor-not-allowed 
          disabled:opacity-50
        `,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        className="
          flex items-center justify-center
        "
      >
        <Circle
          className="
            h-2.5 w-2.5
            sm:h-3 sm:w-3
            md:h-3.5 md:w-3.5

            fill-current text-current
          "
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
