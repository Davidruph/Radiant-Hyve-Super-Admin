import { LuSchool } from "react-icons/lu";
import { Link } from "react-router-dom";

const Card = ({ title, count, summary, icon, path }) => {
  return (
    <Link to={path}>
      <div className="w-[288.20001220703125px] flex-col flex h-[217.56px] bg-white border-[0.8px] stats-card rounded-[16px] p-[20px] gap-4">
        <div className="w-[44px] h-[44px] rounded-[14px] px-[12px] icon-card flex items-center justify-center">
          {icon ? icon : <LuSchool className="text-white text-2xl" />}
        </div>
        <p className="card-title">{title}</p>
        <p className="card-count">{count}</p>
        <p className="card-summary">{summary}</p>
      </div>
    </Link>
  );
};

export default Card;
