import alertComponentSource from './alert-dialog/AlertDialog.vue?raw'
import AlertDialogExample from './alert-dialog/AlertDialogExample.vue'
import alertCallableSource from './alert-dialog/callable.ts?raw'
import alertCallerSource from './alert-dialog/ShowAlertButton.vue?raw'
import bottomSheetComponentSource from './bottom-sheet/BottomSheet.vue?raw'
import BottomSheetExample from './bottom-sheet/BottomSheetExample.vue'
import bottomSheetCallableSource from './bottom-sheet/callable.ts?raw'
import bottomSheetCallerSource from './bottom-sheet/ShareButton.vue?raw'
import BroadcastUpdateExample from './broadcast-update/BroadcastUpdateExample.vue'
import broadcastUpdateCallableSource from './broadcast-update/callable.ts?raw'
import broadcastUpdateComponentSource from './broadcast-update/UploadPill.vue?raw'
import broadcastUpdateCallerSource from './broadcast-update/UploadQueueButton.vue?raw'
import callerResolveComponentSource from './caller-resolve/ApprovalDialog.vue?raw'
import callerResolveCallableSource from './caller-resolve/callable.ts?raw'
import CallerResolveExample from './caller-resolve/CallerResolveExample.vue'
import callerResolveCallerSource from './caller-resolve/RequestApprovalButton.vue?raw'
import colorPickerCallableSource from './color-picker/callable.ts?raw'
import colorPickerComponentSource from './color-picker/ColorPicker.vue?raw'
import ColorPickerExample from './color-picker/ColorPickerExample.vue'
import colorPickerCallerSource from './color-picker/ColorSwatch.vue?raw'
import commandPaletteCallableSource from './command-palette/callable.ts?raw'
import commandPaletteComponentSource from './command-palette/CommandPalette.vue?raw'
import CommandPaletteExample from './command-palette/CommandPaletteExample.vue'
import commandPaletteCallerSource from './command-palette/CommandPaletteTrigger.vue?raw'
import confirmCallableSource from './confirm-dialog/callable.ts?raw'
import confirmComponentSource from './confirm-dialog/ConfirmDialog.vue?raw'
import ConfirmDialogExample from './confirm-dialog/ConfirmDialogExample.vue'
import confirmCallerSource from './confirm-dialog/DeleteButton.vue?raw'
import contextMenuCallableSource from './context-menu/callable.ts?raw'
import contextMenuComponentSource from './context-menu/ContextMenu.vue?raw'
import ContextMenuExample from './context-menu/ContextMenuExample.vue'
import contextMenuCallerSource from './context-menu/ContextMenuTrigger.vue?raw'
import errorBannerCallableSource from './error-banner/callable.ts?raw'
import errorBannerComponentSource from './error-banner/ErrorBanner.vue?raw'
import ErrorBannerExample from './error-banner/ErrorBannerExample.vue'
import errorBannerCallerSource from './error-banner/TriggerErrorButton.vue?raw'
import type { ExampleMeta } from './example-context'
import imageLightboxCallableSource from './image-lightbox/callable.ts?raw'
import imageLightboxCallerSource from './image-lightbox/ImageGallery.vue?raw'
import imageLightboxComponentSource from './image-lightbox/ImageLightbox.vue?raw'
import ImageLightboxExample from './image-lightbox/ImageLightboxExample.vue'
import itemPickerCallableSource from './item-picker/callable.ts?raw'
import itemPickerCallerSource from './item-picker/FruitPickerTrigger.vue?raw'
import itemPickerComponentSource from './item-picker/ItemPicker.vue?raw'
import ItemPickerExample from './item-picker/ItemPickerExample.vue'
import liveStatusCallableSource from './live-status/callable.ts?raw'
import liveStatusComponentSource from './live-status/LiveStatus.vue?raw'
import LiveStatusExample from './live-status/LiveStatusExample.vue'
import liveStatusCallerSource from './live-status/PlaceOrderButton.vue?raw'
import nestedDialogCallableSource from './nested-dialog/callable.ts?raw'
import nestedDialogComponentSource from './nested-dialog/NestedDialog.vue?raw'
import NestedDialogExample from './nested-dialog/NestedDialogExample.vue'
import nestedDialogCallerSource from './nested-dialog/OpenNestedButton.vue?raw'
import optionalMutationCallableSource from './optional-mutation/callable.ts?raw'
import optionalMutationComponentSource from './optional-mutation/OptionalMutationConfirm.vue?raw'
import OptionalMutationExample from './optional-mutation/OptionalMutationExample.vue'
import optionalMutationCallerSource from './optional-mutation/PublishButton.vue?raw'
import permissionPromptCallableSource from './permission-prompt/callable.ts?raw'
import permissionPromptCallerSource from './permission-prompt/ConnectButton.vue?raw'
import permissionPromptComponentSource from './permission-prompt/PermissionPrompt.vue?raw'
import PermissionPromptExample from './permission-prompt/PermissionPromptExample.vue'
import progressToastCallableSource from './progress-toast/callable.ts?raw'
import progressToastComponentSource from './progress-toast/ProgressToast.vue?raw'
import ProgressToastExample from './progress-toast/ProgressToastExample.vue'
import progressToastCallerSource from './progress-toast/ProgressToastTrigger.vue?raw'
import promptCallableSource from './prompt-input/callable.ts?raw'
import promptComponentSource from './prompt-input/PromptInput.vue?raw'
import PromptInputExample from './prompt-input/PromptInputExample.vue'
import promptCallerSource from './prompt-input/RenameButton.vue?raw'
import rootContextCallerSource from './root-context/AskButton.vue?raw'
import rootContextCallableSource from './root-context/callable.ts?raw'
import rootContextComponentSource from './root-context/Greeter.vue?raw'
import RootContextExample from './root-context/RootContextExample.vue'
import saveFormCallableSource from './save-form/callable.ts?raw'
import saveFormCallerSource from './save-form/NewItemButton.vue?raw'
import saveFormComponentSource from './save-form/SaveForm.vue?raw'
import SaveFormExample from './save-form/SaveFormExample.vue'
import sideDrawerCallableSource from './side-drawer/callable.ts?raw'
import sideDrawerCallerSource from './side-drawer/OpenSettingsButton.vue?raw'
import sideDrawerComponentSource from './side-drawer/SettingsDrawer.vue?raw'
import SettingsDrawerExample from './side-drawer/SettingsDrawerExample.vue'
import wizardCallableSource from './wizard/callable.ts?raw'
import wizardCallerSource from './wizard/StartWizardButton.vue?raw'
import wizardComponentSource from './wizard/Wizard.vue?raw'
import WizardExample from './wizard/WizardExample.vue'

export interface ExampleEntry {
  slug: string
  meta: ExampleMeta
  component: typeof ConfirmDialogExample
  componentSource: string
  callableSource: string
  callerSource: string
}

const exampleEntries: readonly ExampleEntry[] = [
  {
    slug: 'error-banner',
    meta: {
      title: 'Auto-dismissing error',
      description:
        'A transient banner that closes itself via setTimeout. Multiple calls stack — each error gets its own banner.',
      category: 'notification',
      behaviors: ['stacking'],
      tags: ['error', 'auto-dismiss', 'stack'],
      files: { callable: 'ErrorBanner.vue + callable.ts', caller: 'TriggerErrorButton.vue' },
      order: 11,
    },
    component: ErrorBannerExample,
    componentSource: errorBannerComponentSource,
    callableSource: errorBannerCallableSource,
    callerSource: errorBannerCallerSource,
  },
  {
    slug: 'save-form',
    meta: {
      title: 'Save form with mutation flow',
      description:
        'A dialog with an async submit. useMutationFlow tracks pending; on throw, the call stays open so the user can retry without losing their input.',
      category: 'flow',
      behaviors: ['mutation-flow'],
      tags: ['async', 'submit', 'retry'],
      files: { callable: 'SaveForm.vue + callable.ts', caller: 'NewItemButton.vue' },
      order: 5,
    },
    component: SaveFormExample,
    componentSource: saveFormComponentSource,
    callableSource: saveFormCallableSource,
    callerSource: saveFormCallerSource,
  },
  {
    slug: 'root-context',
    meta: {
      title: 'Account-aware dialog',
      description:
        'A dialog that greets the signed-in user without the caller ever passing their name. The user lives on a Root prop and reaches every call through call.root — separate from the per-call props.',
      category: 'flow',
      behaviors: ['root-props'],
      tags: ['root-props', 'context', 'shared'],
      files: { callable: 'Greeter.vue + callable.ts', caller: 'AskButton.vue' },
      order: 6,
      rootProps: 'userName="Ada Lovelace"',
    },
    component: RootContextExample,
    componentSource: rootContextComponentSource,
    callableSource: rootContextCallableSource,
    callerSource: rootContextCallerSource,
  },
  {
    slug: 'optional-mutation',
    meta: {
      title: 'Confirm with optional async',
      description:
        'One Callable, two callers. Omit mutationFn and submit().orEnd(true) closes instantly with a fallback response; pass one and the async handler decides when to close — the same Confirm serves both.',
      category: 'flow',
      behaviors: ['mutation-flow'],
      tags: ['optional', 'orEnd', 'fallback'],
      files: { callable: 'OptionalMutationConfirm.vue + callable.ts', caller: 'PublishButton.vue' },
      order: 7,
    },
    component: OptionalMutationExample,
    componentSource: optionalMutationComponentSource,
    callableSource: optionalMutationCallableSource,
    callerSource: optionalMutationCallerSource,
  },
  {
    slug: 'caller-resolve',
    meta: {
      title: 'Resolve from the caller',
      description:
        "The promise from call() is the call's identity. A timeout in the caller settles that exact open call from the outside with Approval.end(promise, false) — delivering a response without any in-dialog click.",
      category: 'flow',
      behaviors: ['end-from-caller'],
      tags: ['timeout', 'external', 'promise'],
      files: { callable: 'ApprovalDialog.vue + callable.ts', caller: 'RequestApprovalButton.vue' },
      order: 62,
    },
    component: CallerResolveExample,
    componentSource: callerResolveComponentSource,
    callableSource: callerResolveCallableSource,
    callerSource: callerResolveCallerSource,
  },
  {
    slug: 'nested-dialog',
    meta: {
      title: 'Nested dialog',
      description:
        'A Callable that opens itself. Each open instance can spawn the same Callable from inside its own template — the library tracks the stack and resolves each promise independently.',
      category: 'dialog',
      behaviors: ['nested', 'stacking'],
      tags: ['recursion', 'stack'],
      files: { callable: 'NestedDialog.vue + callable.ts', caller: 'OpenNestedButton.vue' },
      order: 4,
    },
    component: NestedDialogExample,
    componentSource: nestedDialogComponentSource,
    callableSource: nestedDialogCallableSource,
    callerSource: nestedDialogCallerSource,
  },
  {
    slug: 'permission-prompt',
    meta: {
      title: 'Permission consent',
      description:
        'OAuth-style "do you allow X?" prompt. Resolves with allow or deny — a tagged response, not a boolean.',
      category: 'dialog',
      behaviors: [],
      tags: ['oauth', 'consent'],
      files: { callable: 'PermissionPrompt.vue + callable.ts', caller: 'ConnectButton.vue' },
      order: 61,
    },
    component: PermissionPromptExample,
    componentSource: permissionPromptComponentSource,
    callableSource: permissionPromptCallableSource,
    callerSource: permissionPromptCallerSource,
  },
  {
    slug: 'broadcast-update',
    meta: {
      title: 'Broadcast to every call',
      description:
        'Several upload pills stacked at once. One Upload.update(props) with no promise merges into every open call, so a single connection change flips them all — while each keeps its own filename.',
      category: 'notification',
      behaviors: ['update', 'stacking'],
      tags: ['broadcast', 'status', 'stack'],
      files: { callable: 'UploadPill.vue + callable.ts', caller: 'UploadQueueButton.vue' },
      order: 13,
    },
    component: BroadcastUpdateExample,
    componentSource: broadcastUpdateComponentSource,
    callableSource: broadcastUpdateCallableSource,
    callerSource: broadcastUpdateCallerSource,
  },
  {
    slug: 'live-status',
    meta: {
      title: 'Live status update',
      description:
        'A pinned status pill. The caller pushes new props into the open call as work advances — same instance, updated from the outside via the promise reference.',
      category: 'notification',
      behaviors: ['update'],
      tags: ['status', 'live', 'tracker'],
      files: { callable: 'LiveStatus.vue + callable.ts', caller: 'PlaceOrderButton.vue' },
      order: 12,
    },
    component: LiveStatusExample,
    componentSource: liveStatusComponentSource,
    callableSource: liveStatusCallableSource,
    callerSource: liveStatusCallerSource,
  },
  {
    slug: 'item-picker',
    meta: {
      title: 'Item picker',
      description:
        'Show a list and resolve with the chosen item. Caller-side cancellation returns null; selecting an item returns the object itself.',
      category: 'picker',
      behaviors: [],
      tags: ['list', 'select'],
      files: { callable: 'ItemPicker.vue + callable.ts', caller: 'FruitPickerTrigger.vue' },
      order: 20,
    },
    component: ItemPickerExample,
    componentSource: itemPickerComponentSource,
    callableSource: itemPickerCallableSource,
    callerSource: itemPickerCallerSource,
  },
  {
    slug: 'color-picker',
    meta: {
      title: 'Color picker',
      description:
        'A grid of swatches. The current value is forwarded as a prop so the picker can render it as selected; resolves with the chosen hex or null.',
      category: 'picker',
      behaviors: [],
      tags: ['color', 'grid'],
      files: { callable: 'ColorPicker.vue + callable.ts', caller: 'ColorSwatch.vue' },
      order: 21,
    },
    component: ColorPickerExample,
    componentSource: colorPickerComponentSource,
    callableSource: colorPickerCallableSource,
    callerSource: colorPickerCallerSource,
  },
  {
    slug: 'confirm-dialog',
    meta: {
      title: 'Confirm dialog',
      description:
        'Ask the user to confirm a destructive action before it runs. Returns a boolean to the caller.',
      category: 'dialog',
      behaviors: [],
      tags: ['destructive', 'boolean'],
      files: { callable: 'ConfirmDialog.vue + callable.ts', caller: 'DeleteButton.vue' },
      order: 1,
    },
    component: ConfirmDialogExample,
    componentSource: confirmComponentSource,
    callableSource: confirmCallableSource,
    callerSource: confirmCallerSource,
  },
  {
    slug: 'alert-dialog',
    meta: {
      title: 'Alert dialog',
      description:
        'A one-button notice. The caller awaits acknowledgement; the response type is void — the act of closing is the value.',
      category: 'dialog',
      behaviors: [],
      tags: ['info', 'one-button'],
      files: { callable: 'AlertDialog.vue + callable.ts', caller: 'ShowAlertButton.vue' },
      order: 2,
    },
    component: AlertDialogExample,
    componentSource: alertComponentSource,
    callableSource: alertCallableSource,
    callerSource: alertCallerSource,
  },
  {
    slug: 'prompt-input',
    meta: {
      title: 'Prompt for input',
      description:
        'window.prompt(), but with your component. Resolves with the entered string, or null on cancel.',
      category: 'dialog',
      behaviors: [],
      tags: ['text-input', 'string', 'rename'],
      files: { callable: 'PromptInput.vue + callable.ts', caller: 'RenameButton.vue' },
      order: 3,
    },
    component: PromptInputExample,
    componentSource: promptComponentSource,
    callableSource: promptCallableSource,
    callerSource: promptCallerSource,
  },
  {
    slug: 'command-palette',
    meta: {
      title: 'Command palette (⌘K)',
      description:
        'A searchable list of actions. Keyboard-driven: arrow keys to navigate, Enter to run, Esc to dismiss.',
      category: 'menu',
      behaviors: [],
      tags: ['cmdk', 'search', 'keyboard'],
      files: {
        callable: 'CommandPalette.vue + callable.ts',
        caller: 'CommandPaletteTrigger.vue',
      },
      order: 31,
    },
    component: CommandPaletteExample,
    componentSource: commandPaletteComponentSource,
    callableSource: commandPaletteCallableSource,
    callerSource: commandPaletteCallerSource,
  },
  {
    slug: 'bottom-sheet',
    meta: {
      title: 'Bottom sheet',
      description:
        'Slides up from the bottom and back down on close — the mobile-native pattern for action menus and quick choices.',
      category: 'drawer',
      behaviors: ['exit-animation'],
      tags: ['mobile', 'actions'],
      files: { callable: 'BottomSheet.vue + callable.ts', caller: 'ShareButton.vue' },
      order: 40,
    },
    component: BottomSheetExample,
    componentSource: bottomSheetComponentSource,
    callableSource: bottomSheetCallableSource,
    callerSource: bottomSheetCallerSource,
  },
  {
    slug: 'wizard',
    meta: {
      title: 'Multi-step wizard',
      description:
        'A signup flow with three steps and a back/forward navigation. State lives inside the Callable; the caller awaits a single structured response.',
      category: 'flow',
      behaviors: [],
      tags: ['multi-step', 'form', 'onboarding'],
      files: { callable: 'Wizard.vue + callable.ts', caller: 'StartWizardButton.vue' },
      order: 60,
    },
    component: WizardExample,
    componentSource: wizardComponentSource,
    callableSource: wizardCallableSource,
    callerSource: wizardCallerSource,
  },
  {
    slug: 'context-menu',
    meta: {
      title: 'Context menu',
      description:
        'A positioned menu opened on right-click. The caller forwards the cursor coordinates so the Callable renders at the click site.',
      category: 'menu',
      behaviors: [],
      tags: ['right-click', 'positioned'],
      files: { callable: 'ContextMenu.vue + callable.ts', caller: 'ContextMenuTrigger.vue' },
      order: 30,
    },
    component: ContextMenuExample,
    componentSource: contextMenuComponentSource,
    callableSource: contextMenuCallableSource,
    callerSource: contextMenuCallerSource,
  },
  {
    slug: 'progress-toast',
    meta: {
      title: 'Progress toast',
      description:
        'A singleton toast that updates itself as work progresses. Uses upsert() so consecutive calls mutate the same instance.',
      category: 'notification',
      behaviors: ['upsert'],
      tags: ['progress', 'singleton'],
      files: { callable: 'ProgressToast.vue + callable.ts', caller: 'ProgressToastTrigger.vue' },
      order: 10,
    },
    component: ProgressToastExample,
    componentSource: progressToastComponentSource,
    callableSource: progressToastCallableSource,
    callerSource: progressToastCallerSource,
  },
  {
    slug: 'side-drawer',
    meta: {
      title: 'Settings drawer',
      description:
        'A panel that slides in from the edge and slides back out on close. Props carry the initial settings as plain data; the Callable owns its own form state and resolves with the saved values, or null if the user dismisses.',
      category: 'drawer',
      behaviors: ['exit-animation'],
      tags: ['settings', 'panel', 'form'],
      files: { callable: 'SettingsDrawer.vue + callable.ts', caller: 'OpenSettingsButton.vue' },
      order: 41,
    },
    component: SettingsDrawerExample,
    componentSource: sideDrawerComponentSource,
    callableSource: sideDrawerCallableSource,
    callerSource: sideDrawerCallerSource,
  },
  {
    slug: 'image-lightbox',
    meta: {
      title: 'Image lightbox',
      description:
        'Click a thumbnail, open the full image as an overlay. The Callable closes on backdrop click or Escape.',
      category: 'overlay',
      behaviors: [],
      tags: ['gallery', 'image'],
      files: { callable: 'ImageLightbox.vue + callable.ts', caller: 'ImageGallery.vue' },
      order: 50,
    },
    component: ImageLightboxExample,
    componentSource: imageLightboxComponentSource,
    callableSource: imageLightboxCallableSource,
    callerSource: imageLightboxCallerSource,
  },
]

// Matches upstream react-call's own gallery order (its meta.ts `order`
// values), so both sites list examples in the same sequence.
export const examples: readonly ExampleEntry[] = [...exampleEntries].sort((left, right) => {
  const orderDifference = (left.meta.order ?? 100) - (right.meta.order ?? 100)
  return orderDifference || left.meta.title.localeCompare(right.meta.title)
})

export function getExample(slug: string): ExampleEntry | undefined {
  return examples.find((example) => example.slug === slug)
}
