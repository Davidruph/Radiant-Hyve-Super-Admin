import { useNavigate } from "react-router-dom";
import errorIllustration from "../../../assets/Svg/error-illustration.svg";

function Main() {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-full bg-[#293FE3] overflow-hidden">
      <div className="py-2">
        <div className="container">
          <div className="flex flex-col items-center justify-center h-screen text-center error-page lg:flex-row lg:text-left">
            <div className="-intro-x lg:mr-20">
              <img
                alt="Midone Tailwind HTML Admin Template"
                className="w-[450px] h-48 lg:h-auto"
                src={errorIllustration}
              />
            </div>
            <div className="mt-10 text-white lg:mt-0">
              <div className="font-medium intro-x text-8xl">404</div>
              <div className="mt-5 text-xl font-medium intro-x lg:text-3xl">
                Oops. This page has gone missing.
              </div>
              <div className="mt-3 text-lg intro-x">
                You may have mistyped the address or the page may have moved.
              </div>
              <button
                className="px-4 py-3 mt-10 text-white border rounded-lg border-white intro-x dark:border-darkmode-400 dark:text-slate-200"
                onClick={() => navigate("/school_admin/login")}
              >
                Go to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
