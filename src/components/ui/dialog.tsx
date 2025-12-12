"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        `
        fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
        data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0

        /* RESPONSIVE IMPROVEMENTS */
        sm:bg-black/40
        md:bg-black/35
        lg:bg-black/30
      `,
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />

      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          `
          bg-background fixed z-50 grid gap-4 rounded-lg border shadow-lg
          duration-200 

          /* CENTERING */
          top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]

          /* ANIMATIONS */
          data-[state=open]:animate-in 
          data-[state=open]:fade-in-0 
          data-[state=open]:zoom-in-95
          data-[state=closed]:animate-out 
          data-[state=closed]:fade-out-0 
          data-[state=closed]:zoom-out-95

          /* RESPONSIVE WIDTH */
          w-full max-w-[calc(100%-1.25rem)]
          p-4
          sm:max-w-md sm:p-5
          md:max-w-lg md:p-6
          lg:max-w-xl lg:p-8

          /* RESPONSIVE BORDER RADIUS */
          sm:rounded-lg
          md:rounded-xl
          lg:rounded-2xl
        `,
          className
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="
            absolute top-3 right-3
            rounded-xs opacity-70 transition-opacity
            hover:opacity-100
            focus:ring-2 focus:ring-offset-2 
            ring-offset-background focus:ring-ring 

            /* RESPONSIVE SIZE */
            [&_svg:not([class*='size-'])]:size-4
            sm:[&_svg:not([class*='size-'])]:size-5
            lg:[&_svg:not([class*='size-'])]:size-6
          "
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        `
        flex flex-col gap-2 text-center 

        /* RESPONSIVE TEXT ALIGNMENT */
        sm:text-left
        md:gap-3
        lg:gap-4
      `,
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        `
        flex flex-col-reverse gap-2

        /* RESPONSIVE BUTTON ALIGNMENT */
        sm:flex-row sm:justify-end
        md:gap-3
        lg:gap-4
      `,
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        `
        font-semibold leading-none

        /* RESPONSIVE TITLES */
        text-lg 
        sm:text-xl 
        md:text-2xl
      `,
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        `
        text-muted-foreground

        /* RESPONSIVE DESCRIPTION */
        text-sm 
        sm:text-base 
        md:text-lg
      `,
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
