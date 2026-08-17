const guardStack = []

export function pushGuard(handler) {
  guardStack.push(handler)
  history.pushState(null, '')
}

export function popGuard(handler) {
  const idx = guardStack.indexOf(handler)
  if (idx !== -1) guardStack.splice(idx, 1)
}

export function popLastGuard() {
  if (guardStack.length > 0) {
    const handler = guardStack.pop()
    handler()
    return true
  }
  return false
}

export function hasGuards() {
  return guardStack.length > 0
}
