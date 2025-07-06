import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/shadcn/dialog';
import { cn } from '@/lib/utils';

const CreateUpdateModal = ({
  id,
  isOpen,
  onClose,
  entityName,
  isCreate,
  FormComponent,
  onSubmitComplete,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent
      className={cn(
        'overflow-hidden p-0',
        entityName === 'property' && !isCreate && 'md:max-w-4xl'
      )}
    >
      <DialogHeader className="px-6 pt-6">
        <DialogTitle>
          {isCreate ? `Create ${entityName}` : `Update ${entityName}`}
        </DialogTitle>
        <DialogDescription className="sr-only"></DialogDescription>
      </DialogHeader>
      <div className="max-h-[80vh] overflow-y-auto px-6 pb-6">
        <FormComponent
          id={id}
          isCreate={isCreate}
          onSubmitComplete={onSubmitComplete}
          onCancel={onClose}
        />
      </div>
    </DialogContent>
  </Dialog>
);

export default CreateUpdateModal;
