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

export const examples: readonly ExampleEntry[] = [
  {
    slug: 'error-banner',
    meta: {
      title: 'Error banner',
      description:
        'Stack assertive, self-dismissing error banners without making their calls overlap.',
      category: 'notification',
      behaviors: ['stacking'],
      files: { callable: 'ErrorBanner.vue + callable.ts', caller: 'TriggerErrorButton.vue' },
    },
    component: ErrorBannerExample,
    componentSource: errorBannerComponentSource,
    callableSource: errorBannerCallableSource,
    callerSource: errorBannerCallerSource,
  },
  {
    slug: 'save-form',
    meta: {
      title: 'Save form',
      description:
        'A mutation-flow form stays open after a handled failure, so the user can correct and retry.',
      category: 'flow',
      behaviors: ['mutation-flow'],
      files: { callable: 'SaveForm.vue + callable.ts', caller: 'NewItemButton.vue' },
    },
    component: SaveFormExample,
    componentSource: saveFormComponentSource,
    callableSource: saveFormCallableSource,
    callerSource: saveFormCallerSource,
  },
  {
    slug: 'root-context',
    meta: {
      title: 'Root context',
      description:
        'Pass shared data at the mounted root and read it from each call through call.root.',
      category: 'flow',
      behaviors: ['root-props'],
      files: { callable: 'Greeter.vue + callable.ts', caller: 'AskButton.vue' },
    },
    component: RootContextExample,
    componentSource: rootContextComponentSource,
    callableSource: rootContextCallableSource,
    callerSource: rootContextCallerSource,
  },
  {
    slug: 'optional-mutation',
    meta: {
      title: 'Optional mutation',
      description:
        'Use a mutation handler when supplied, or fall back to an immediate response when it is absent.',
      category: 'flow',
      behaviors: ['mutation-flow'],
      files: { callable: 'OptionalMutationConfirm.vue + callable.ts', caller: 'PublishButton.vue' },
    },
    component: OptionalMutationExample,
    componentSource: optionalMutationComponentSource,
    callableSource: optionalMutationCallableSource,
    callerSource: optionalMutationCallerSource,
  },
  {
    slug: 'caller-resolve',
    meta: {
      title: 'Caller-side resolve',
      description:
        'Keep the call promise in caller scope and settle that exact dialog from a timeout.',
      category: 'flow',
      behaviors: ['end-from-caller'],
      files: { callable: 'ApprovalDialog.vue + callable.ts', caller: 'RequestApprovalButton.vue' },
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
        'A callable opens itself, preserving a distinct promise and stack position per dialog.',
      category: 'dialog',
      behaviors: ['nested', 'stacking'],
      files: { callable: 'NestedDialog.vue + callable.ts', caller: 'OpenNestedButton.vue' },
    },
    component: NestedDialogExample,
    componentSource: nestedDialogComponentSource,
    callableSource: nestedDialogCallableSource,
    callerSource: nestedDialogCallerSource,
  },
  {
    slug: 'permission-prompt',
    meta: {
      title: 'Permission prompt',
      description: 'Request scoped consent and await an allow-or-deny result from the caller.',
      category: 'dialog',
      behaviors: [],
      files: { callable: 'PermissionPrompt.vue + callable.ts', caller: 'ConnectButton.vue' },
    },
    component: PermissionPromptExample,
    componentSource: permissionPromptComponentSource,
    callableSource: permissionPromptCallableSource,
    callerSource: permissionPromptCallerSource,
  },
  {
    slug: 'broadcast-update',
    meta: {
      title: 'Broadcast update',
      description:
        'Update every open upload notification at once while each one retains its own label.',
      category: 'notification',
      behaviors: ['update', 'stacking'],
      files: { callable: 'UploadPill.vue + callable.ts', caller: 'UploadQueueButton.vue' },
    },
    component: BroadcastUpdateExample,
    componentSource: broadcastUpdateComponentSource,
    callableSource: broadcastUpdateCallableSource,
    callerSource: broadcastUpdateCallerSource,
  },
  {
    slug: 'live-status',
    meta: {
      title: 'Live status',
      description:
        'Hold one call promise and update that exact notification as an order progresses.',
      category: 'notification',
      behaviors: ['update'],
      files: { callable: 'LiveStatus.vue + callable.ts', caller: 'PlaceOrderButton.vue' },
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
      description: 'Show a list and resolve with the chosen item, or null when cancelled.',
      category: 'picker',
      behaviors: [],
      files: { callable: 'ItemPicker.vue + callable.ts', caller: 'FruitPickerTrigger.vue' },
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
        'A grid of swatches. The current value is forwarded as a prop so the picker can render it as selected.',
      category: 'picker',
      behaviors: [],
      files: { callable: 'ColorPicker.vue + callable.ts', caller: 'ColorSwatch.vue' },
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
      files: { callable: 'ConfirmDialog.vue + callable.ts', caller: 'DeleteButton.vue' },
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
        'A one-button notice. The caller awaits acknowledgement; closing is the response.',
      category: 'dialog',
      behaviors: [],
      files: { callable: 'AlertDialog.vue + callable.ts', caller: 'ShowAlertButton.vue' },
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
      files: { callable: 'PromptInput.vue + callable.ts', caller: 'RenameButton.vue' },
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
        'A searchable list of actions. Arrow keys navigate, Enter runs, and Esc dismisses.',
      category: 'menu',
      behaviors: [],
      files: {
        callable: 'CommandPalette.vue + callable.ts',
        caller: 'CommandPaletteTrigger.vue',
      },
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
        'Slides up from the bottom and back down on close — the mobile-native pattern for quick actions.',
      category: 'drawer',
      behaviors: ['exit-animation'],
      files: { callable: 'BottomSheet.vue + callable.ts', caller: 'ShareButton.vue' },
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
      description: 'A three-step signup flow. One await resolves with the whole form.',
      category: 'flow',
      behaviors: [],
      files: { callable: 'Wizard.vue + callable.ts', caller: 'StartWizardButton.vue' },
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
        'Forwards the cursor position to a positioned Callable and resolves with the selected action.',
      category: 'menu',
      behaviors: [],
      files: { callable: 'ContextMenu.vue + callable.ts', caller: 'ContextMenuTrigger.vue' },
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
        'A singleton notification that updates itself via upsert() while async work progresses.',
      category: 'notification',
      behaviors: ['upsert'],
      files: { callable: 'ProgressToast.vue + callable.ts', caller: 'ProgressToastTrigger.vue' },
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
        'A settings panel that slides in from the side and keeps its exit animation before unmounting.',
      category: 'drawer',
      behaviors: ['exit-animation'],
      files: { callable: 'SettingsDrawer.vue + callable.ts', caller: 'OpenSettingsButton.vue' },
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
        'Click a thumbnail to open the full image as an overlay; backdrop click and Escape close it.',
      category: 'overlay',
      behaviors: [],
      files: { callable: 'ImageLightbox.vue + callable.ts', caller: 'ImageGallery.vue' },
    },
    component: ImageLightboxExample,
    componentSource: imageLightboxComponentSource,
    callableSource: imageLightboxCallableSource,
    callerSource: imageLightboxCallerSource,
  },
]

export function getExample(slug: string): ExampleEntry | undefined {
  return examples.find((example) => example.slug === slug)
}
