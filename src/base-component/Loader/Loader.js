import { Oval, ThreeDots } from "react-loader-spinner";

export const OvalLoader = () => {
  return (
    <div className="flex items-center justify-center h-[70vh] z-50">
      <Oval
        height="50"
        width="50"
        color="#9810FA"
        secondaryColor="#E5E7EB"
        ariaLabel="oval-loading"
      />
    </div>
  );
};

export const DotLoader = () => {
  return (
    <div className="flex items-center justify-center z-50">
      <ThreeDots height="40" width="40" color="#fff" ariaLabel="dots-loading" />
    </div>
  );
};
