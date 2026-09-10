type AdminCharCountProps = {
  value: string;
  max: number;
};

const AdminCharCount = ({ value, max }: AdminCharCountProps) => (
  <span className="text-tooltip text-text-muted">
    {value.length}/{max}
  </span>
);

export default AdminCharCount;
