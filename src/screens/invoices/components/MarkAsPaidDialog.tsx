import React, { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { CheckCircle, DollarSign, FileText, X, CreditCard, Smartphone } from 'lucide-react-native' // ✅ ADDED: More appropriate icons
import type { Invoice } from '../../../types/database' // ✅ FIXED: Use database types

export default function MarkAsPaidDialog({
  open,
  onClose,
  onSave,
  colors,
}: {
  open: boolean
  onClose: () => void
  onSave: (status: Invoice['status'], paymentMethod: Invoice['payment_method']) => Promise<void> // ✅ FIXED: payment_method
  colors: any
}) {
  const [paymentMethod, setPaymentMethod] = useState<Invoice['payment_method']>('cash') // ✅ FIXED: Use database enum and default value
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ FIXED: Update payment methods to match database enum values
  const paymentMethods = [
    { value: 'cash', icon: DollarSign, label: 'Cash Payment' },
    { value: 'upi', icon: Smartphone, label: 'UPI Payment' },
    { value: 'bank_transfer', icon: FileText, label: 'Bank Transfer' },
  ] as const

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '80%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 8,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground }}>
              Mark as Paid
            </Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ padding: 8 }}>
              <X size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 15,
              color: colors.mutedForeground,
              paddingHorizontal: 24,
              marginBottom: 24,
              lineHeight: 22,
            }}
          >
            Select the payment method used for this invoice.
          </Text>
          <View style={{ gap: 12, paddingHorizontal: 24, marginBottom: 32 }}>
            {paymentMethods.map((pm) => {
              const IconComp = pm.icon
              const isSelected = paymentMethod === pm.value
              return (
                <TouchableOpacity
                  key={pm.value}
                  activeOpacity={0.7}
                  onPress={() => setPaymentMethod(pm.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + '10' : colors.background,
                    gap: 12,
                  }}
                >
                  <IconComp size={18} color={isSelected ? colors.primary : colors.mutedForeground} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: isSelected ? colors.primary : colors.foreground,
                      }}
                    >
                      {pm.label}
                    </Text>
                  </View>
                  {isSelected && <CheckCircle size={18} color={colors.primary} />}
                </TouchableOpacity>
              )
            })}
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              paddingHorizontal: 24,
              paddingBottom: 34,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: colors.muted,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.mutedForeground }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                setIsSubmitting(true)
                await onSave('paid', paymentMethod) // ✅ FIXED: Use lowercase 'paid' status
                setIsSubmitting(false)
              }}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={{
                flex: 2,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                borderRadius: 12,
                gap: 8,
                backgroundColor: colors.primary,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting && (
                <ActivityIndicator size="small" color={colors.primaryForeground} style={{ marginRight: 8 }} />
              )}
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.primaryForeground }}>
                {isSubmitting ? 'Processing...' : 'Confirm Payment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}


// import React, { useState } from 'react'
// import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
// import { CheckCircle, DollarSign, FileText, X } from 'lucide-react-native'
// import type { Invoice } from '../../../types'

// export default function MarkAsPaidDialog({
//   open,
//   onClose,
//   onSave,
//   colors,
// }: {
//   open: boolean
//   onClose: () => void
//   onSave: (status: Invoice['status'], paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer') => Promise<void>
//   colors: any
// }) {
//   const [paymentMethod, setPaymentMethod] = useState<Invoice['paymentMethod']>('Cash')
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const paymentMethods = [
//     { value: 'Cash', icon: DollarSign, label: 'Cash Payment' },
//     { value: 'Card', icon: CheckCircle, label: 'Card Payment' },
//     { value: 'Bank Transfer', icon: FileText, label: 'Bank Transfer' },
//   ]

//   return (
//     <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: 'rgba(0,0,0,0.5)',
//           justifyContent: 'flex-end',
//         }}
//       >
//         <View
//           style={{
//             backgroundColor: colors.card,
//             borderTopLeftRadius: 24,
//             borderTopRightRadius: 24,
//             maxHeight: '80%',
//           }}
//         >
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               paddingHorizontal: 24,
//               paddingTop: 24,
//               paddingBottom: 8,
//             }}
//           >
//             <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground }}>
//               Mark as Paid
//             </Text>
//             <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ padding: 8 }}>
//               <X size={24} color={colors.mutedForeground} />
//             </TouchableOpacity>
//           </View>

//           <Text
//             style={{
//               fontSize: 15,
//               color: colors.mutedForeground,
//               paddingHorizontal: 24,
//               marginBottom: 24,
//               lineHeight: 22,
//             }}
//           >
//             Select the payment method used for this invoice.
//           </Text>

//           <View style={{ gap: 12, paddingHorizontal: 24, marginBottom: 32 }}>
//             {paymentMethods.map((pm) => {
//               const IconComp = pm.icon
//               const isSelected = paymentMethod === pm.value

//               return (
//                 <TouchableOpacity
//                   key={pm.value}
//                   activeOpacity={0.7}
//                   onPress={() => setPaymentMethod(pm.value as Invoice['paymentMethod'])}
//                   style={{
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     paddingHorizontal: 16,
//                     paddingVertical: 16,
//                     borderRadius: 12,
//                     borderWidth: 2,
//                     borderColor: isSelected ? colors.primary : colors.border,
//                     backgroundColor: isSelected ? colors.primary + '10' : colors.background,
//                     gap: 12,
//                   }}
//                 >
//                   <IconComp size={18} color={isSelected ? colors.primary : colors.mutedForeground} />
//                   <View style={{ flex: 1 }}>
//                     <Text
//                       style={{
//                         fontSize: 16,
//                         fontWeight: '600',
//                         color: isSelected ? colors.primary : colors.foreground,
//                       }}
//                     >
//                       {pm.label}
//                     </Text>
//                   </View>
//                   {isSelected && <CheckCircle size={18} color={colors.primary} />}
//                 </TouchableOpacity>
//               )
//             })}
//           </View>

//           <View
//             style={{
//               flexDirection: 'row',
//               gap: 12,
//               paddingHorizontal: 24,
//               paddingBottom: 34,
//             }}
//           >
//             <TouchableOpacity
//               onPress={onClose}
//               activeOpacity={0.7}
//               style={{
//                 flex: 1,
//                 paddingVertical: 16,
//                 borderRadius: 12,
//                 alignItems: 'center',
//                 backgroundColor: colors.muted,
//               }}
//             >
//               <Text style={{ fontSize: 16, fontWeight: '600', color: colors.mutedForeground }}>
//                 Cancel
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={async () => {
//                 setIsSubmitting(true)
//                 await onSave('Paid', paymentMethod)
//                 setIsSubmitting(false)
//               }}
//               disabled={isSubmitting}
//               activeOpacity={0.8}
//               style={{
//                 flex: 2,
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 paddingVertical: 16,
//                 borderRadius: 12,
//                 gap: 8,
//                 backgroundColor: colors.primary,
//                 opacity: isSubmitting ? 0.7 : 1,
//               }}
//             >
//               {isSubmitting && (
//                 <ActivityIndicator size="small" color={colors.primaryForeground} style={{ marginRight: 8 }} />
//               )}
//               <Text style={{ fontSize: 16, fontWeight: '600', color: colors.primaryForeground }}>
//                 {isSubmitting ? 'Processing...' : 'Confirm Payment'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   )
// }
