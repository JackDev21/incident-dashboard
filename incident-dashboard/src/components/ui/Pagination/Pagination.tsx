import React from 'react'
import styles from './Pagination.module.scss'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </div>
      <div className={styles.controls}>
        <button 
          className={styles.pageButton} 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        {/* Simple page numbers for small sets, could be improved for many pages */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
          .map((p, index, array) => (
            <React.Fragment key={p}>
              {index > 0 && array[index-1] !== p - 1 && <span className={styles.ellipsis}>...</span>}
              <button 
                className={`${styles.pageButton} ${p === currentPage ? styles.active : ''}`} 
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
              {index < array.length - 1 && array[index+1] !== p + 1 && <span className={styles.ellipsis}>...</span>}
            </React.Fragment>
          ))}

        <button 
          className={styles.pageButton} 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}