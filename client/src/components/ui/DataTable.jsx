'use client';

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
} from '@/components/shadcn/table';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { TbEdit, TbTrash, TbPlus, TbEye } from 'react-icons/tb';
import { Input } from '@/components/shadcn/input';
import { Button } from '@/components/shadcn/button';
import { Skeleton } from '@/components/shadcn/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select';
import dayjs from 'dayjs';
import ReactPaginate from 'react-paginate';
import { cn } from '@/lib/utils';
import RemoveConfirmModal from '@/components/ui/RemoveConfirmModal';
import CreateUpdateModal from '@/components/ui/CreateUpdateModal';

const Pagination = ({ pageCount, onPageChange, currentPage, forcePage }) => (
  <ReactPaginate
    forcePage={forcePage}
    previousLabel={<span className="">Prev</span>}
    nextLabel={<span className="">Next</span>}
    breakLabel={'...'}
    pageCount={pageCount}
    marginPagesDisplayed={2}
    pageRangeDisplayed={5}
    onPageChange={onPageChange}
    containerClassName={'flex items-center space-x-2'}
    pageLinkClassName={
      'px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors'
    }
    activeLinkClassName={
      'text-purple-600 border border-purple-600 bg-white rounded-md'
    }
    breakClassName={'px-3 py-2 text-gray-700'}
    previousLinkClassName={cn(
      'px-3 py-2 rounded-md transition-colors',
      currentPage === 0
        ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
        : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
    )}
    nextLinkClassName={cn(
      'px-3 py-2 rounded-md transition-colors',
      currentPage === pageCount - 1
        ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
        : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
    )}
    disabledClassName={'pointer-events-none'}
    ariaDisabledClassName={'text-gray-300'}
    pageClassName={'flex items-center'}
  />
);

const PageSizeSelector = ({ value, onChange }) => (
  <div className="flex items-center gap-x-3 w-16 text-sm">
    <span>Show</span>
    <Select value={value} onValueChange={onChange}>
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
);

const DataTable = ({
  searchQuery,
  removeMutation,
  columns,
  FormComponent,
  allowView = false,
  allowCreate = true,
  allowUpdate = true,
  entityName,
}) => {
  const columnsHelper = createColumnHelper();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setcurrentPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [modalType, setModalType] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const {
    data: items,
    isLoading: isItemsLoading,
    isFetching: isItemsFetching,
  } = searchQuery({
    page: searchTerm ? 1 : currentPage + 1,
    limit,
    q: searchTerm,
  });
  const [removeMutate, { isLoading: isRemoveLoading }] = removeMutation();
  const totalPages = Math.max(items?.meta?.totalPages || 0, 1);
  const mergedColumns = [
    columnsHelper.display({
      header: '#',
      size: 30,
      cell: info =>
        searchTerm
          ? info.row.index + 1
          : info.row.index + 1 + currentPage * items?.meta?.pageSize,
    }),
    ...columns,
    columnsHelper.accessor('createdAt', {
      header: 'Created At',
      size: 120,
      cell: info => (
        <div className="whitespace-normal break-words text-wrap">
          {dayjs(info.getValue()).format('DD MMM YYYY hh:mm A')}
        </div>
      ),
    }),
    columnsHelper.accessor('updatedAt', {
      header: 'Updated At',
      size: 120,
      cell: info => (
        <div className="whitespace-normal break-words text-wrap">
          {dayjs(info.getValue()).format('DD MMM YYYY hh:mm A')}
        </div>
      ),
    }),
    columnsHelper.display({
      header: 'Actions',
      size: 100,
      cell: ({ row }) => {
        const id = row.original.id;
        const postId = row.original?.post?.id;

        return (
          <div className="flex gap-x-3">
            {allowView && (
              <TbEye
                className="size-5 cursor-pointer text-blue-600"
                onClick={() => handleOpenModal('view', id)}
              />
            )}
            {allowUpdate && (
              <TbEdit
                className="size-5 cursor-pointer text-orange-600"
                onClick={() => handleOpenModal('update', id)}
              />
            )}
            <TbTrash
              className="size-5 cursor-pointer text-red-600"
              onClick={() => handleOpenModal('remove', id, postId)}
            />
          </div>
        );
      },
    }),
  ];

  const handleOpenModal = (type, id = null, parentId = null) => {
    setModalType(type);
    setSelectedId(id);
    setSelectedParentId(parentId);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedId(null);
  };

  const handleSubmitComplete = () => {
    handleCloseModal();
  };

  const handleRemoveConfirm = async () => {
    try {
      const result = entityName === 'comment' ? await removeMutate({ postId: selectedParentId, commentId: selectedId }).unwrap() : await removeMutate(selectedId).unwrap();
      toast.success(result.message);
      handleCloseModal();
    } catch (e) {
      toast.error('Failed to remove item');
    }
  };

  const table = useReactTable({
    data: items?.data || [],
    columns: mergedColumns,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    rowCount: items?.meta?.totalItems || 0,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Input
          type="text"
          placeholder="Search..."
          className="w-64 lg:w-80"
          onChange={e => setSearchTerm(e.target.value)}
        />
        {allowCreate && (
          <Button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <TbPlus className="size-4" />
            <span>Add</span>
          </Button>
        )}
      </div>

      <div className="overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.column.columnDef.size,
                      minWidth: header.column.columnDef.size,
                      maxWidth: header.column.columnDef.size,
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
            {isItemsLoading || isItemsFetching ? (
              Array.from({ length: 10 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {table.getVisibleFlatColumns().map((col, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleFlatColumns().length}
                  className="h-64 text-center border-0"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.columnDef.size,
                          minWidth: cell.column.columnDef.size,
                          maxWidth: cell.column.columnDef.size,
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
                {Array.from({
                  length: Math.max(0, 10 - table.getRowModel().rows.length),
                }).map((_, i) => (
                  <TableRow key={`empty-${i}`}>
                    {table.getVisibleFlatColumns().map((col, j) => (
                      <TableCell key={j}>
                        <div className="h-6" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between mt-4">
        <PageSizeSelector
          value={limit}
          onChange={value => {
            setLimit(value);
            setcurrentPage(0);
          }}
        />

        <Pagination
          currentPage={currentPage}
          pageCount={totalPages}
          onPageChange={page => setcurrentPage(page.selected)}
          forcePage={currentPage}
        />
      </div>

      <CreateUpdateModal
        id={selectedId}
        entityName={entityName}
        isOpen={modalType === 'create' || modalType === 'update'}
        isCreate={modalType === 'create'}
        onClose={handleCloseModal}
        FormComponent={FormComponent}
        onSubmitComplete={handleSubmitComplete}
      />

      <RemoveConfirmModal
        isOpen={modalType === 'remove'}
        onConfirm={handleRemoveConfirm}
        onClose={handleCloseModal}
        isLoading={isRemoveLoading}
      />
    </>
  );
};

export default DataTable;
