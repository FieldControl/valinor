/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import styles from "./styles.module.scss";
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/classic.css";

type PaginationProps = {
  page: number;
  setPage: (e: any) => void;
};

const Pagination: FC<PaginationProps> = ({ page, setPage }) => {
  return (
    <div className={styles.container}>
      <ResponsivePagination
        current={page}
        onPageChange={(e) => setPage(e)}
        total={100}
        maxWidth={7}
        nextLabel="Next >"
        previousLabel="< Previous"
      />
    </div>
  );
};

export default Pagination;
