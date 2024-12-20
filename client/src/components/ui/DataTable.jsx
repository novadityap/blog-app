import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@/components/ui/table';
import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { TbEdit, TbTrash, TbPlus } from 'react-icons/tb';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import ManageItemModal from '@/components/ui/ManageItemModal';

const DataTable = ({
  columns,
  useGetQuery,
  useLazyGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  FormComponent,
  canAdd = true,
  canEdit = true,
}) => {
  const columnsHelper = createColumnHelper();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setcurrentPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    data: allData,
    isLoading: isLoadingAllData,
    isFetching: isFetchingAllData,
    refetch,
  } = useGetQuery({
    page: searchTerm ? 1 : currentPage + 1,
    limit,
    search: searchTerm,
  });
  const [
    triggerGetById,
    { data: singleData, isFetching: isFetchingSingleData },
  ] = useLazyGetByIdQuery();
  const [createMutation] = useCreateMutation();
  const [updateMutation] = useUpdateMutation();
  const [deleteMutation] = useDeleteMutation();

  const mergedColumns = [
    columnsHelper.display({
      header: '#',
      size: 20,
      cell: info =>
        searchTerm
          ? info.row.index + 1
          : info.row.index + 1 + currentPage * allData?.meta?.pageSize,
    }),
    ...columns,
    columnsHelper.display({
      header: 'Actions',
      size: 40,
      cell: ({ row }) => {
        return (
          <div className="flex gap-x-2">
            {canEdit && (
              <TbEdit
                className="size-5 cursor-pointer text-orange-600"
                onClick={() => handleEdit(row.original._id)}
              />
            )}
            <TbTrash
              className="size-5 cursor-pointer text-red-600"
              onClick={() => handleDelete(row.original._id)}
            />
          </div>
        );
      },
    }),
  ];

  const handlePageChange = page => setcurrentPage(page.selected);
  const handleSearchChange = e => setSearchTerm(e.target.value);

  const handleCreate = () => {
    setSelectedId(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = async id => {
    await triggerGetById(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = id => {
    setSelectedId(id);
    setIsDeleteModalOpen(true);
  };

  const handleCreateConfirm = async values => {
    try {
      const res = await createMutation(values).unwrap();

      setIsCreateModalOpen(false);
      setSelectedId(null);
      refetch();
      toast.success(res.message);
    } catch (err) {
      return { errors: err.errors };
    }
  };

  const handleUpdateConfirm = async values => {
    try {
      const res = await updateMutation({
        id: singleData?.data?._id,
        data: values,
      }).unwrap();

      setIsEditModalOpen(false);
      setSelectedId(null);
      refetch();
      toast.success(res.message);

      return { data: res.data, errors: null };
    } catch (err) {
      return { data: null, errors: err.errors };
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteMutation(selectedId).unwrap();

      setIsDeleteModalOpen(false);
      setSelectedId(null);
      toast.success(res.message);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const table = useReactTable({
    data: allData?.data || [],
    columns: mergedColumns,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    rowCount: allData?.meta?.totalItems || 0,
  });

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex items-center justify-between mb-4">
        <Input
          type="text"
          placeholder="Search..."
          className="w-64 lg:w-80"
          onChange={handleSearchChange}
        />
        {canAdd && (
          <Button onClick={handleCreate}>
            <TbPlus className="mr-2 size-5" />
            Add New
          </Button>
        )}
      </div>

      {isLoadingAllData || isFetchingAllData ? (
       <div className="flex flex-col gap-y-4">
       {Array.from({ length: 5 }).map((_, index) => (
         <Skeleton key={`row-skeleton-${index}`} className="h-4 w-full" />
       ))}
       {Array.from({ length: 5 }).map((_, index) => (
         <Skeleton
           key={`row-skeleton-large-${index}`}
           className="h-6 w-full"
         />
      ))}
     </div>
      ) : (
        <div className='rounded-md shadow-md overflow-x-auto min-h-96'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} >
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      style={{
                        width: `${header.getSize()}px`,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: `${cell.column.getSize()}px`,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <div className="flex items-center gap-x-3 w-16 text-sm">
          <span>Show</span>
          <Select
            value={allData?.meta?.pageSize}
            onValueChange={value => {
              setLimit(value);
              setcurrentPage(0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={10}>10</SelectItem>
              <SelectItem value={25}>25</SelectItem>
              <SelectItem value={50}>50</SelectItem>
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>

        <Pagination
          currentPage={currentPage}
          pageCount={allData?.meta?.totalPages}
          onPageChange={handlePageChange}
          forcePage={currentPage}
        />
      </div>

      <ManageItemModal
        open={isEditModalOpen || isCreateModalOpen}
        onToggle={(open) => {
          setIsCreateModalOpen(open);
          setIsEditModalOpen(open);

          if (isCreateModalOpen && singleData?.data) singleData.data = null;
        }}
        title={isCreateModalOpen ? 'Create' : 'Update'}
      >
         <FormComponent
            initialValues={
              isEditModalOpen && singleData?.data ? singleData?.data : {}
            }
            onSubmit={
              isCreateModalOpen ? handleCreateConfirm : handleUpdateConfirm
            }
            onCancel={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
            }}
            isCreate={isCreateModalOpen}
            isLoading={isFetchingSingleData}
          />
      </ManageItemModal>

      {/* <Dialog
        className="w-3/4"
        open={isCreateModalOpen || isEditModalOpen}
        onOpenChange={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);

          if (isCreateModalOpen && singleData?.data) singleData.data = null;
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreateModalOpen ? 'Create' : 'Update'}</DialogTitle>
          </DialogHeader>
          <FormComponent
            initialValues={
              isEditModalOpen && singleData?.data ? singleData?.data : {}
            }
            onSubmit={
              isCreateModalOpen ? handleCreateConfirm : handleUpdateConfirm
            }
            onCancel={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
            }}
            isCreate={isCreateModalOpen}
            isLoading={isFetchingSingleData}
          />
        </DialogContent>
      </Dialog> */}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onToggle={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default DataTable;
