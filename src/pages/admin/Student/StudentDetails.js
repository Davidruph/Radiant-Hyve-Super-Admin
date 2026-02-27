import { useEffect, useState } from "react";
import BackIcon from "../../../assets/icons/BackIcon.png";
import { useNavigate, useParams } from "react-router-dom";
import { getNewStudentDetailsApi } from "../../../services/api_services";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";

export default function StudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [newStudentData, setNewStudentData] = useState({});
  const [loading, setLoading] = useState(false);

  const getNewStudentDetails = () => {
    setLoading(true);

    let obj = {
      student_id: id
    };

    getNewStudentDetailsApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        console.log("message", message);
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setNewStudentData(datas);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          navigate("/school_admin/login");
          localStorage.removeItem("radient_school_token");
          localStorage.removeItem("refresh_school_token");
          localStorage.removeItem("deviceIdSchool");
        } else {
          const errs = err?.response?.data;
          toast.error(errs?.message);
          if (errs.status === 2) {
            navigate("/school_admin/student");
          }
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    getNewStudentDetails();
  }, [id]);

  return (
    <div>
      <div className="mb-5">
        <button
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <img src={BackIcon} className="w-[38px] h-[38px]" alt="" />
          <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
            Back
          </span>
        </button>
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-4 col-span-12 bg-white max-h-[300px] rounded-lg p-5">
          <div className="flex flex-col items-center justify-center h-full">
            {loading ? (
              <>
                <Skeleton circle height={138} width={138} />
                <Skeleton height={20} width={120} className="mt-4" />
                <Skeleton height={20} width={160} className="mt-3" />
                <Skeleton height={20} width={160} className="mt-3" />
              </>
            ) : (
              <>
                <img
                  src={newStudentData?.profile_pic || PlaceholderImg}
                  className="object-cover w-[138px] h-[138px] rounded-full"
                  alt=""
                />
                <h3 className="text-[#0F1113] font-medium md:text-base text-sm mt-4">
                  {newStudentData?.full_name}
                </h3>
                <h3 className="text-[#4B5563] font-normal md:text-sm text-xs mt-3">
                  Student Id: :{" "}
                  <span className="text-[#1F1F1F] font-normal md:text-sm text-xs">
                    {newStudentData?.id}
                  </span>
                </h3>
                <h3 className="text-[#4B5563] font-normal md:text-sm text-xs mt-3">
                  Parents Id: :{" "}
                  <span className="text-[#1F1F1F] font-normal md:text-sm text-xs">
                    {newStudentData?.parent_id}
                  </span>
                </h3>
              </>
            )}
          </div>
        </div>
        <div className="lg:col-span-8 col-span-12 bg-white rounded-lg p-5">
          <div className="flex xl:flex-row lg:flex-col md:flex-row flex-col gap-5 items-start justify-between">
            <h2 className="text-[#1F1F1F] font-semibold md:text-xl text-lg">
              Student Information
            </h2>
          </div>

          <div className="mt-7 space-y-5">
            {[
              { label: "Full Name", value: newStudentData?.full_name },
              { label: "Parents Name", value: newStudentData?.parent_name },
              {
                label: "Home Phone Number",
                value: `${newStudentData?.country_code} ${newStudentData?.mobile_no}`
              },
              { label: "Date of Birth", value: newStudentData?.dob },
              { label: "Gender", value: newStudentData?.gender },
              {
                label: "Relation",
                value: newStudentData?.relation_to_child || "-"
              },
              {
                label: "Frequency Attendance",
                value: newStudentData?.Shift?.shift_name || "-"
              },
              {
                label: "Medical Insurance Number",
                value: newStudentData?.madical_insuarance_no || "-"
              },
              { label: "Address", value: newStudentData?.address || "-" },
              {
                label: "Teacher",
                value: newStudentData?.Teacher?.full_name || "-"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <h4 className="text-[#4B5563] text-sm font-normal">
                  {item.label}
                </h4>
                <span className="text-[#1F1F1F] font-normal text-end text-sm">
                  {loading ? <Skeleton height={20} width={150} /> : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
