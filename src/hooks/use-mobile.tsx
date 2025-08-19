import * as React from "react";
import { Dimensions, ScaledSize } from "react-native";

const MOBILE_BREAKPOINT = 768;

/**
 * @deprecated This hook is deprecated and will be removed in a future version. 
 * Use responsive design with StyleSheet instead.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const updateSize = ({ window }: { window: ScaledSize }) => {
      setIsMobile(window.width < MOBILE_BREAKPOINT);
    };
    // Initial check
    setIsMobile(Dimensions.get("window").width < MOBILE_BREAKPOINT);

    const subscription = Dimensions.addEventListener("change", updateSize);

    // Only use .remove() - do not call removeEventListener (it's gone in recent RN)
    return () => {
      if (typeof subscription?.remove === "function") {
        subscription.remove();
      }
      // else: nothing. (For very old RN, you'd need an alternate, but don't add removeEventListener!)
    };
  }, []);

  return !!isMobile;
}
