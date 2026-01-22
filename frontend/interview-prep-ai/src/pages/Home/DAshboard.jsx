import React, { useState, useEffect } from "react";
import { LuPlus } from "react-icons/lu";
import { CARD_BG } from "../../utils/data";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPath";
import moment from "moment";
import SummaryCard from "../../components/Cards/SummaryCard";
import CreateSessionForm from "../Home/CreateSessionForm";
import Modal from "../../components/Modal";
import DeleteAlertContent from "../../components/Loader/DeleteAlertContent";

const Dashboard = () => {
  const navigate = useNavigate();

  const [openCreateModal, setOpencreateModal] = useState(false);
  const [session, setSession] = useState([]);

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const fetchAllSession = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ALL
      );

     
      setSession(response.data.sessions || []);

    } catch (error) {
      console.error("Error fetching session data:", error);
      setSession([]);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(
        API_PATHS.SESSION.DELETE(sessionData?._id)
      );

      toast.success("Session deleted successfully");
      setOpenDeleteAlert({ open: false, data: null });
      fetchAllSession();

    } catch (error) {
      console.error("Error deleting session data", error);
    }
  };

  useEffect(() => {
    fetchAllSession();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto pt-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7 pt-1 pb-6 px-4 md:px-0">

          {Array.isArray(session) && session.length > 0 ? (
            session.map((data, index) => (
              <SummaryCard
                key={data?._id}
                colors={CARD_BG[index % CARD_BG.length]}
                role={data?.role}
                topicsToFocus={data?.topicsToFocus}
                experience={data?.experience}
                question={data?.question?.length || 0}
                description={data?.description}
                lastUpdated={
                  data?.updatedAt
                    ? moment(data.updatedAt).format("Do MMM YYYY")
                    : "N/A"
                }
                onSelect={() =>
                  navigate(`/interview-prep/${data?._id}`)
                }
                onDelete={() =>
                  setOpenDeleteAlert({ open: true, data })
                }
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No sessions found
            </p>
          )}

        </div>

        {/* ADD BUTTON */}
        <button
          className="h-12 flex items-center justify-center gap-3 bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full fixed bottom-10 right-10 hover:shadow-2xl hover:shadow-orange-300"
          onClick={() => setOpencreateModal(true)}
        >
          <LuPlus className="text-2xl" />
          Add New
        </button>
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={openCreateModal}
        onClose={() => setOpencreateModal(false)}
        hideHeader
      >
        <CreateSessionForm />
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={openDeleteAlert.open}
        onClose={() =>
          setOpenDeleteAlert({ open: false, data: null })
        }
        title="Delete Alert"
      >
        <div className="w-[30vw]">
          <DeleteAlertContent
            content="Are you sure you want to delete this session?"
            onDelete={() =>
              deleteSession(openDeleteAlert.data)
            }
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;
