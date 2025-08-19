import React from 'react'
import { View, StyleSheet, Platform, ViewProps } from 'react-native'
import { Sheet, SheetContent } from '../../../components/ui/Sheet'
import { useSidebar } from './SidebarProvider'

export interface SidebarProps extends ViewProps {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
  children: React.ReactNode
}

export const Sidebar = React.forwardRef<View, SidebarProps>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { state, isMobile, openMobile, setOpenMobile } = useSidebar()
    const SIDEBAR_WIDTH = 280 // px (18rem) as number

    if (collapsible === 'none') {
      return (
        <View
          ref={ref}
          style={[styles.sidebar, style, { width: SIDEBAR_WIDTH }]}
          {...props}
        >
          {children}
        </View>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side}
            style={[styles.sheetContent, { width: SIDEBAR_WIDTH }]}
            onClose={() => setOpenMobile(false)}
          >
            <View style={{ flex: 1 }}>{children}</View>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <View
        ref={ref}
        style={[
          styles.sidebar,
          style,
          {
            width: SIDEBAR_WIDTH,
            backgroundColor: '#f1f5f9', // fallback for "bg-sidebar"
            height: '100%',
          },
        ]}
        // Optionally pass extra props or data- attributes if needed for web hybrid
        {...props}
      >
        {children}
      </View>
    )
  }
)
Sidebar.displayName = 'Sidebar'

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#f1f5f9', // Your bg-sidebar
    height: '100%',
    // width is set dynamically above, or can be set here if desired
  },
  sheetContent: {
    padding: 0,
    backgroundColor: '#f1f5f9',
    height: '100%',
  },
})

export default Sidebar
