import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ManageItemModal = ({
  open,
  onToggle,
  title,
  children,
}) => {
  return (
    <Dialog open={open} onOpenChange={onToggle}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
export default ManageItemModal;
