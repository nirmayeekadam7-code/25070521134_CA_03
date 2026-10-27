export default function Spinner({ full }) {
  return (
    <div className={full ? 'spinner-wrap full' : 'spinner-wrap'}>
      <div className="spinner" aria-label="Loading" />
    </div>
  );
}
