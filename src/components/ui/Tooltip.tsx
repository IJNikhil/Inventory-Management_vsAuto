import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native'

type TooltipProps = {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip = ({
  content,
  children,
  side = 'top',
}: TooltipProps) => {
  const [visible, setVisible] = useState(false)

  // Positioning logic
  const getTooltipStyle = (): ViewStyle[] => {
    let stylesArray: ViewStyle[] = [styles.tooltipBase]
    if (side === 'top') stylesArray.push(styles.tooltipTop)
    else if (side === 'bottom') stylesArray.push(styles.tooltipBottom)
    else if (side === 'left') stylesArray.push(styles.tooltipLeft)
    else if (side === 'right') stylesArray.push(styles.tooltipRight)
    return stylesArray
  }

  return (
    <View style={styles.relative}>
      <Pressable
        onPressIn={() => setVisible(true)}
        onPressOut={() => setVisible(false)}
      >
        {children}
      </Pressable>
      {visible && (
        <View style={getTooltipStyle()}>
          <Text style={styles.tooltipText}>{content}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  relative: {
    position: 'relative',
    alignItems: 'center',
  },
  tooltipBase: {
    position: 'absolute',
    zIndex: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#18181b',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 9,
    maxWidth: 200,
    alignItems: 'center',
  },
  tooltipTop: {
    bottom: '100%',
    marginBottom: 7,
    left: '50%',
    transform: [{ translateX: -100 }],
  },
  tooltipBottom: {
    top: '100%',
    marginTop: 7,
    left: '50%',
    transform: [{ translateX: -100 }],
  },
  tooltipLeft: {
    right: '100%',
    marginRight: 7,
    top: '50%',
    transform: [{ translateY: -16 }],
  },
  tooltipRight: {
    left: '100%',
    marginLeft: 7,
    top: '50%',
    transform: [{ translateY: -16 }],
  },
  tooltipText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
})
