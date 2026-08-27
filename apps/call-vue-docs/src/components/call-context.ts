/**
 * Local structural view of call-vue's injected prop.
 *
 * Vue's SFC compiler recursively expands imported generic component types when
 * producing runtime props. Keeping this small structural type local avoids a
 * TypeScript 6 compiler recursion while remaining assignable to CallContext.
 */
export interface DemoCallContext<Response, RootProps = Record<string, never>> {
  key: string
  end: (response: Response) => void
  ended: boolean
  root: RootProps
  index: number
  stackSize: number
}
