import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import MultipleSelect from "../../../components/CustomSelectUser/CustomSelectUser";
import { DotLoader } from "../../../base-component/Loader/Loader";
import {
  getParentAdminApi,
  parentPushNotificationApi
} from "../../../services/api_services";
import toast from "react-hot-toast";

export default function ParentReminder() {
  const [loader, setLoader] = useState(false);
  const [parentAdminList, setParentAdminList] = useState([]);

  const validationSchema = Yup.object({
    title: Yup.string().required("Notification title is required"),
    description: Yup.string().required("Notification body is required"),
    sendTo: Yup.string().required("Please select who to send to"),
    selectedUsers: Yup.array().when("sendTo", {
      is: "select",
      then: (schema) => schema.min(1, "Please select at least one user"),
      otherwise: (schema) => schema.notRequired()
    })
  });

  const initialValues = {
    title: "",
    description: "",
    sendTo: "",
    selectedUsers: []
  };

  const getParentAdminList = () => {
    getParentAdminApi()
      .then((res) => {
        console.log("res>>>", res);
        let list = res?.data?.data;
        console.log("list>>>", list);

        list.forEach((item) => {
          item.label = item.full_name;
          item.value = item.id;
          item.image = item.profile_pic;
        });

        setParentAdminList(list);
      })
      .catch((err) => {
        console.log("err>>>", err);
      });
  };

  useEffect(() => {
    getParentAdminList();
  }, []);

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    setLoader(true);

    let obj = {
      title: values.title,
      description: values.description
    };

    if (values.selectedUsers.length > 0) {
      obj.parent_ids = values.selectedUsers;
    }

    parentPushNotificationApi(obj)
      .then((res) => {
        setSubmitting(false);
        resetForm();
        setLoader(false);
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        setLoader(false);
        console.log("err>>>", err);
        toast.error(err?.response?.data?.message);
      });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">Parents Reminder</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="space-y-6 bg-white rounded-lg p-4 mt-5">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Notification Title <span className="text-red-500">*</span>
              </label>
              <Field
                name="title"
                type="text"
                placeholder="Enter title"
                className="w-full border border-[#E5E7EB] text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Notification Body <span className="text-red-500">*</span>
              </label>
              <Field
                name="description"
                as="textarea"
                placeholder="Enter body"
                rows={4}
                className="w-full border border-[#E5E7EB] text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Send To <span className="text-red-500">*</span>
              </label>
              <div className="text-sm flex flex-row items-start gap-x-10 gap-2">
                <label className="flex items-center">
                  <Field
                    name="sendTo"
                    type="radio"
                    value="all"
                    onChange={(e) => setFieldValue("sendTo", e.target.value)}
                    checked={values.sendTo === "all"}
                    className="mr-2 accent-[#9810FA]"
                  />
                  <span className="text-gray-700">All Users</span>
                </label>
                <label className="flex items-center">
                  <Field
                    name="sendTo"
                    type="radio"
                    value="select"
                    onChange={(e) => setFieldValue("sendTo", e.target.value)}
                    checked={values.sendTo === "select"}
                    className="mr-2 accent-[#9810FA]"
                  />
                  <span className="text-gray-700">Select Users</span>
                </label>
              </div>
              <ErrorMessage
                name="sendTo"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {values.sendTo === "select" && (
              <div>
                <MultipleSelect
                  options={parentAdminList}
                  value={values.selectedUsers}
                  onChange={(value) => setFieldValue("selectedUsers", value)}
                  placeholder="Select Users"
                  className="w-full"
                  innerClassName="h-12 px-4 rounded-xl border border-gray-300 text-sm w-full"
                />
                <ErrorMessage
                  name="selectedUsers"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                disabled={loader}
                type="submit"
                className="bg-[#9810FA] text-white font-medium text-sm md:w-40 w-full h-12 rounded-lg"
              >
                {loader ? <DotLoader color="#fff" /> : `Send`}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
