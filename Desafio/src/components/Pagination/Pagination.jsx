import "./Pagination.css";

const MaxItems = 10;
const MaxLeft = (MaxItems - 1) / 2;

const Pagination = ({ limit, offset, setOffset }) => {
  const current = offset ? offset / limit + 1 : 1;
  const frist = Math.max(current - MaxLeft, 1);

  return (
    <ul className="pagination">
      {Array.from({ length: MaxItems })
        .map((_, index) => index + frist)
        .map((page, index) => (
          <li key={index}>
            <button
              className="button"
              key={index}
              onClick={() => setOffset((page - 1) * limit)}
            >
              {page}
            </button>
          </li>
        ))}
    </ul>
  );
};

export default Pagination;
