import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

import styles from "./styles.module.scss";

interface ArrowsProps {
  previousScroll?: () => void;
  nextScroll?: () => void;
  isFetching: boolean;
}

export function Arrows({
  previousScroll = () => {},
  nextScroll = () => {},
  isFetching,
}: ArrowsProps) {
  return (
    <div className={styles.arrowsContainer}>
      <button onClick={() => previousScroll()} type="button">
        <BsChevronLeft />
      </button>
      <button
        title="Avançar"
        disabled={isFetching}
        onClick={() => nextScroll()}
        type="button"
      >
        <BsChevronRight />
      </button>
    </div>
  );
}
