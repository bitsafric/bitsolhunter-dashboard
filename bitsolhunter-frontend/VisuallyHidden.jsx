kimport * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open Dialog</Dialog.Trigger>
      <Dialog.Content>
        <VisuallyHidden>
          <Dialog.Title>Your Dialog Title</Dialog.Title>
        </VisuallyHidden>
        <p>This is the content of the dialog.</p>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default MyDialog;

