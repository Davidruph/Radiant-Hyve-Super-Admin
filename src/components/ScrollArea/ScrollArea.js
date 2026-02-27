export default function ScrollArea({ children, className = '', ...props }) {
  return (
    <div
      className={`overflow-y-auto scroll ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
