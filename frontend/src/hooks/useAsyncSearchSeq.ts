import { useCallback, useRef } from 'react'


export function useAsyncSearchSeq() {
  const seqRef = useRef(0)

  const nextSeq = useCallback(() => ++seqRef.current, [])

  const isLatest = useCallback((seq: number) => seq === seqRef.current, [])

  const invalidate = useCallback(() => {
    seqRef.current += 1
  }, [])

  return { nextSeq, isLatest, invalidate }
}
