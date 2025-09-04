import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const getMatches = (query: string) => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches
    }
    return false 
  }

  const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
  const [isMobile, setIsMobile] = React.useState(() => getMatches(query))

  React.useEffect(() => {
    const mql = window.matchMedia(query)

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }
    setIsMobile(mql.matches)

    if (mql.addEventListener) {
      mql.addEventListener("change", handleChange)
    } else {
    
      mql.addListener(handleChange)
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handleChange)
      } else {
        mql.removeListener(handleChange)
      }
    }
  }, [query])

  return isMobile
}
