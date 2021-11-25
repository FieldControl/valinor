function Loading(props) {
  let { loading } = props;

  return (
    <>
      {loading ? (
        <div className="loader">
          <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Loading;
