"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="
        toaster group

        /* RESPONSIVE WIDTH + POSITIONING */
        max-w-[90%] 
        sm:max-w-sm 
        md:max-w-md 
        lg:max-w-lg

        /* ensure spacing adjusts on mobile */
        px-3 py-2 sm:px-4 sm:py-3
      "
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
