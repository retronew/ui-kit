---
'@retronew/toast-vue': minor
---

Add a `pop` prop to `<ToastWrapper>` for a react-hot-toast-style entrance/exit — a bigger scale pop, asymmetric enter/exit distance and opacity, and distinct enter/exit easing. Off by default; the default motion is unchanged. Shares `--toast-motion-duration` with the default motion, and uses a stronger `--toast-motion-blur` fallback so the blur stays legible against the bigger, faster motion.
