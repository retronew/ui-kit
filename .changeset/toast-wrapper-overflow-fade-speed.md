---
'@retronew/toast-vue': patch
---

Fix toasts briefly overlapping newer ones when queue mode reflows or evicts past the cap:

- `useToaster().calculateOffset` assumed a newly-inserted toast's height was `0` for the render that inserts it (its `<ToastWrapper>` hasn't mounted and measured itself yet), so toasts stacked behind it didn't shift down until a correction landed a moment later — re-triggering their position transition from scratch and producing a visible catch-up jump. It now assumes a configurable `estimatedHeight` (default `44`) for unmeasured toasts instead, so the correction (if any) is small enough to be imperceptible. Tune it via `calculateOffset(toast, { estimatedHeight })` if your toasts are taller.
- A toast fading out while still `visible` (evicted past the queue cap, or piled past the deep-stack limit) now transitions on a fixed, fast `200ms` instead of sharing `--toast-motion-duration` with enter/exit — raising the enter/exit duration no longer makes evicted toasts linger on screen.
