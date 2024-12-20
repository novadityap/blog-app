import ReactPaginate from 'react-paginate';

const Pagination = ({ pageCount, onPageChange, currentPage, forcePage }) => {
  return (
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
      previousLinkClassName={`px-3 py-2 rounded-md transition-colors ${
        currentPage === 0
          ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
          : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
      }`}
      nextLinkClassName={`px-3 py-2 rounded-md transition-colors ${
        currentPage === pageCount - 1
          ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
          : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
      }`}
      disabledClassName={'pointer-events-none'}
      ariaDisabledClassName={'text-gray-300'}
      pageClassName={'flex items-center'}
    />
  );
};

export default Pagination;
