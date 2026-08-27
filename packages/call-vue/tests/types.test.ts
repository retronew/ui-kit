import { describe, expectTypeOf, it } from 'vite-plus/test'
import { h } from 'vue'
import { createCallable } from '../src/index.ts'
import type {
  Callable,
  CallContext,
  CallFunction,
  PropsWithCall,
  UpsertFunction,
  UserComponent,
} from '../src/index.ts'

interface DialogProps {
  message: string
}

type DialogResponse = 'accept' | 'cancel'

interface DialogRootProps {
  accent: string
}

const Dialog: UserComponent<DialogProps, DialogResponse, DialogRootProps> = (props) =>
  h('button', { onClick: () => props.call.end('accept') }, props.message)

const Confirm = createCallable<DialogProps, DialogResponse, DialogRootProps>(Dialog)

const VoidDialog: UserComponent<DialogProps, void, {}> = (props) => h('p', props.message)
const VoidConfirm = createCallable<DialogProps>(VoidDialog)

function assertDialogCalls() {
  Confirm.displayName = 'Confirm'
  const promise = Confirm.call({ message: 'Delete?' })
  Confirm.end(promise, 'accept')
  Confirm.end('cancel')
  Confirm.update(promise, { message: 'Really delete?' })
  Confirm.update({ message: 'Updated' })
  h(Confirm, { accent: '#6366f1' })

  // @ts-expect-error The legacy alias is intentionally not public.
  void Confirm.Root
  // @ts-expect-error The business prop has the wrong type.
  void Confirm.call({ message: 42 })
  // @ts-expect-error The response must match DialogResponse.
  Confirm.end(promise, true)
  // @ts-expect-error Root props are required by the mounted component.
  h(Confirm, {})
}

function assertVoidCalls() {
  const promise = VoidConfirm.call({ message: 'Working' })
  VoidConfirm.end()
  VoidConfirm.end(undefined)
  VoidConfirm.end(promise, undefined)

  // @ts-expect-error A single Promise would be interpreted as a broadcast response at runtime.
  VoidConfirm.end(promise)
}

void assertDialogCalls
void assertVoidCalls

describe('public types', () => {
  it('preserves all public generic contracts', () => {
    expectTypeOf<CallFunction<DialogProps, DialogResponse>>().toEqualTypeOf<
      (props: DialogProps) => Promise<DialogResponse>
    >()
    expectTypeOf<UpsertFunction<DialogProps, DialogResponse>>().toEqualTypeOf<
      (props: DialogProps) => Promise<DialogResponse>
    >()
    expectTypeOf<CallContext<DialogProps, DialogResponse, DialogRootProps>>().toMatchTypeOf<{
      end: (response: DialogResponse) => void
      root: DialogRootProps
      index: number
      stackSize: number
    }>()
    expectTypeOf<PropsWithCall<DialogProps, DialogResponse, DialogRootProps>>().toMatchTypeOf<
      DialogProps & { call: CallContext<DialogProps, DialogResponse, DialogRootProps> }
    >()
    expectTypeOf(Dialog).toMatchTypeOf<
      UserComponent<DialogProps, DialogResponse, DialogRootProps>
    >()
    expectTypeOf(Confirm).toMatchTypeOf<Callable<DialogProps, DialogResponse, DialogRootProps>>()
    expectTypeOf(Confirm.displayName).toEqualTypeOf<string | undefined>()
  })

  it('accepts natural interface root props and rejects invalid calls', () => {
    expectTypeOf(Confirm).toMatchTypeOf<Callable<DialogProps, DialogResponse, DialogRootProps>>()
  })

  it('requires explicit undefined for a targeted void response', () => {
    expectTypeOf(VoidConfirm.end).toBeFunction()
  })
})
