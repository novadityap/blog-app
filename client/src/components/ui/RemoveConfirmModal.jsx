import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/dialog';
import { Button } from '@/components/shadcn/button';
import { TbLoader } from 'react-icons/tb';

const RemoveConfirmModal = ({ isOpen, onClose, onConfirm, isLoading }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Remove</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove this item?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          className="cursor-pointer"
          variant="secondary"
          type="button"
          onClick={() => onClose(false)}
        >
          Cancel
        </Button>
        <Button
          className="cursor-pointer"
          variant="destructive"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <TbLoader className="animate-spin mr-2" />
              Removing
            </>
          ) : (
            'Remove'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default RemoveConfirmModal;
