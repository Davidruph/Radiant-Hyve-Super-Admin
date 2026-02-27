export default function Input({ type = 'text', className = '', ...props }) {
    return (
      <input
        type={type}
        className={`w-full px-3 py-2 bg-[#F9F9F9] rounded-md outline-none shadow-sm  ${className}`}
        {...props}
      />
    );
  }
  