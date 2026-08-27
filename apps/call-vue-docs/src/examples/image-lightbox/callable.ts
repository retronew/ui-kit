import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import ImageLightbox from './ImageLightbox.vue'
export const Lightbox = createCallable<{ src: string; alt: string }, void>(
  ImageLightbox as unknown as UserComponent<{ src: string; alt: string }, void, {}>,
)
