import { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Logo from "../../../assets/logo/Maskgroup.png";
import PDFicon from "../../../assets/icons/DOC.png";
import sendIcon from "../../../assets/icons/sendIcon.png";
import { MdImage } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi2";
import { Socket } from "../../../components/Socket/Socket";
import {
  getChatMessageList,
  sendMessageApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { RxCrossCircled } from "react-icons/rx";
import VideoPlayer from "../../../components/VideoPlayer/VideoPlayer";
import { FaRegCirclePlay } from "react-icons/fa6";
import { Oval } from "react-loader-spinner";
import { HiEye } from "react-icons/hi";
import { IoMdDownload } from "react-icons/io";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { IoArrowDownCircle } from "react-icons/io5";

export default function ChatModule() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const menuRef = useRef(null);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [memberCount, setMemberCount] = useState(0);
  const [messageList, setMessageList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  let userId = localStorage.getItem("radient_school_id");
  const [previews, setPreviews] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [loader, setLoader] = useState(false);
  const [documentNames, setDocumentNames] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const joinRoom = () => {
    if (!joined) {
      Socket.emit("join_group", {
        user_id: userId,
        school_id: userId
      });
      setJoined(true);
    }
  };

  useEffect(() => {
    if (!joined) {
      joinRoom();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNewMessage = (data) => {
    console.log("data", data);
    // setTimeout(() => {
    //     if (scrollRef.current) {
    //         scrollRef.current.scrollTo({
    //             top: 0,
    //             behavior: "smooth",
    //         });
    //     }
    // }, 100);
    setMessageList((prevMessageList) => [data, ...prevMessageList]);
  };

  useEffect(() => {
    Socket.on("new_lesson_chat_message", handleNewMessage);

    return () => {
      Socket.off("new_lesson_chat_message", handleNewMessage);
    };
  }, [Socket, messageList]);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      handleGetMessageList(pageNo);
    }
  }, []);

  const fetchMoreMessages = () => {
    if (pageNo < pageCount) {
      handleGetMessageList(pageNo + 1);
    } else {
      setHasMore(false);
    }
  };

  const handleGetMessageList = (page) => {
    if (!hasMore) return;

    let param = {
      page: page
    };

    getChatMessageList(param)
      .then((res) => {
        if (res.status == 200) {
          const data = res?.data?.data;
          const totalPages = res?.data?.totalPages;
          const member = res?.data?.total_member;

          if (data) {
            if (page == 1) {
              setMessageList(data);
            } else {
              setMessageList((prev) => [...prev, ...data]);
            }
            setPageNo(page);
            setPageCount(totalPages);
            setMemberCount(member);
            setHasMore(page < totalPages);
          } else {
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        const errs = err?.response?.data;
        if (err.response.status === 401) {
          toast.error(errs.errors[0].msg);
          localStorage.clear();
          navigate("/user");
        } else {
          if (errs?.errors) {
            toast.error(errs?.errors[0].msg);
          } else {
            toast.error(errs?.message);
          }
        }
        setIsLoading(false);
      });
  };

  const handleFiles = async (files, type) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const newPreviews = [];

    const newDocumentNames = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const url = URL.createObjectURL(file);

      newPreviews.push({ type, url, file });

      if (type === "document") {
        newDocumentNames.push(file.name);
      }

      if (type === "video") {
        await generateVideoThumbnail(file, previews.length + i);
      }
    }

    setInput("");
    setPreviews((prev) => [...prev, ...newPreviews]);

    if (type === "document") {
      setDocumentNames((prev) => [...prev, ...newDocumentNames]);
    }

    setOpen(false);
  };

  const generateVideoThumbnail = (file, fileIndex) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.src = URL.createObjectURL(file);
      video.currentTime = 1;
      video.onloadeddata = () => {
        canvas.width = video.videoWidth / 4;
        canvas.height = video.videoHeight / 4;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          const thumbnailFile = new File([blob], `${file.name}_thumbnail.jpg`, {
            type: "image/jpeg"
          });

          setThumbnails((prevThumbnails) => ({
            ...prevThumbnails,
            [fileIndex]: thumbnailFile
          }));

          resolve(thumbnailFile);
        }, "image/jpeg");
      };

      video.onerror = () => {
        resolve(null);
      };
    });
  };

  const handleRemove = (indexToRemove) => {
    console.log("object", indexToRemove);
    setPreviews((prev) => {
      const updated = [...prev];
      const removed = updated.splice(indexToRemove, 1)[0];
      if (removed?.url) {
        URL.revokeObjectURL(removed.url);
      }

      return updated;
    });
  };

  const isTypeAlreadySelected = (type) => {
    return previews.length > 0 && previews.some((item) => item.type !== type);
  };

  const handleSend = async () => {
    if (loader || !userId) return;
    setLoader(true);

    const formData = new FormData();
    let messageTypes = [];

    const hasText = input.trim() !== "";
    const hasMedia = previews.length > 0;

    if (hasMedia) {
      messageTypes = previews.map((item) => {
        if (item.type === "image") return "Image";
        if (item.type === "video") return "Video";
        return "Document";
      });
    } else if (hasText) {
      messageTypes.push("Text");
    }

    if (documentNames.length > 0) {
      formData.append("file_name", JSON.stringify(documentNames));
    }

    formData.append("message_type", JSON.stringify(messageTypes));

    if (hasText) {
      formData.append("message_text", input.trim());
    }

    previews.forEach((item, index) => {
      if (item.type === "video") {
        formData.append("media", item.file);
        const thumbnailFile = thumbnails[index];
        if (thumbnailFile) {
          formData.append("thumbnail", thumbnailFile);
        }
      } else {
        formData.append("media", item.file);
      }
    });

    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    sendMessageApi(formData)
      .then((res) => {
        if (res.data.status === 1) {
          setInput("");
          setPreviews([]);
          setThumbnails({});
          setOpen(false);
        } else {
          toast.error(res.data.message);
        }
        setLoader(false);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          localStorage.removeItem("loca-user-info");
          navigate("/login");
        } else {
          toast.error(err.response.data.message);
        }
        setLoader(false);
      });
  };

  const getFileName = (url) => {
    try {
      return decodeURIComponent(url.split("/").pop());
    } catch {
      return "document.pdf";
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};

    messages.forEach((msg) => {
      const msgDate = moment(msg.createdAt);
      let groupKey = "";

      if (msgDate.isSame(moment(), "day")) {
        groupKey = "Today";
      } else if (msgDate.isSame(moment().subtract(1, "days"), "day")) {
        groupKey = "Yesterday";
      } else if (msgDate.isSame(moment(), "week")) {
        groupKey = msgDate.format("dddd");
      } else {
        groupKey = msgDate.format("MMMM DD, YYYY");
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }

      grouped[groupKey].push({
        ...msg,
        displayTime: msgDate.format("hh:mm A"),
        fullLabel:
          grouped[groupKey].length === 0
            ? `${groupKey} ${msgDate.format("hh:mm A")}`
            : msgDate.format("hh:mm A")
      });
    });

    for (const groupKey in grouped) {
      grouped[groupKey].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    return grouped;
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom = Math.abs(container.scrollTop) < 100;
      setShowScrollButton(!isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const groupedMessages = groupMessagesByDate(messageList);

  return (
    <div className="w-full mx-auto bg-white rounded-xl p-4 border flex flex-col 2xl:h-[80vh] lg:h-[75vh] h-[80vh]">
      <div className="border-b bg-white sticky top-0 pb-4 z-10">
        <div className="flex items-center gap-2">
          <img
            src={Logo}
            className="w-[40px] h-[40px] object-cover"
            alt="Logo"
          />
          <div>
            <h2 className="text-lg font-semibold">Radiant Hyve</h2>
            <p className="text-sm text-gray-500">
              {isLoading ? (
                <Skeleton width={80} height={16} />
              ) : (
                `${memberCount} Members`
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div
          ref={scrollRef}
          id="scrollableDiv"
          className="h-full w-full overflow-y-auto scroll p-2"
          style={{
            display: "flex",
            flexDirection: "column-reverse"
          }}
        >
          {isLoading ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 sm:px-5 px-2 sm:py-5 py-3 space-y-4 md1:block hidden">
                <div className="flex justify-start">
                  <Skeleton circle width={40} height={40} className="mr-3" />
                  <div>
                    <Skeleton width={100} height={16} className="mb-2" />
                    <Skeleton width={200} height={16} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="text-right">
                    <Skeleton width={80} height={12} className="mb-2 ml-auto" />
                    <Skeleton
                      width={300}
                      height={180}
                      borderRadius={10}
                      className="ml-auto"
                    />
                  </div>
                </div>
                <div className="flex justify-start">
                  <Skeleton
                    width={200}
                    height={200}
                    className="rounded-[10px] ml-auto"
                  />
                </div>

                <div className="flex justify-start">
                  <Skeleton circle width={40} height={40} className="mr-3" />
                  <div>
                    <Skeleton width={120} height={16} className="mb-2" />
                    <div className="border border-gray-300 rounded-lg px-4 py-3 w-[280px]">
                      <Skeleton width={40} height={40} className="mb-2" />
                      <Skeleton width={180} height={14} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 sm:px-5 px-2 sm:py-5 py-3 space-y-4 md1:hidden block">
                <div className="flex items-start">
                  <Skeleton circle width={30} height={30} className="mr-2" />
                  <div>
                    <Skeleton width={150} height={16} className="mb-1" />
                    <Skeleton width={200} height={24} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="text-right">
                    <Skeleton
                      width={150}
                      height={150}
                      className="rounded-[10px] ml-auto"
                    />
                  </div>
                </div>

                <div className="flex items-start">
                  <Skeleton circle width={30} height={30} className="mr-2" />
                  <div>
                    <Skeleton width={150} height={16} className="mb-1" />
                    <div className="border border-gray-100 mt-2 rounded-lg px-4 py-3 w-[250px]">
                      <Skeleton width={35} height={35} className="mb-2" />
                      <Skeleton width={140} height={14} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="text-right">
                    <Skeleton width={200} height={24} />
                    <Skeleton
                      width={100}
                      height={12}
                      className="mb-2 ml-auto"
                    />
                  </div>
                </div>

                <div className="flex items-start">
                  <Skeleton circle width={30} height={30} className="mr-2" />
                  <div>
                    <Skeleton width={150} height={16} className="mb-1" />
                    <div className="flex justify-start">
                      <Skeleton
                        width={150}
                        height={150}
                        className="rounded-[10px] ml-auto"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="border border-gray-100 mt-2 rounded-lg px-4 py-3 w-[250px]">
                    <Skeleton width={35} height={35} className="mb-2" />
                    <Skeleton width={140} height={14} />
                  </div>
                </div>
              </div>
            </div>
          ) : messageList.length > 0 ? (
            messageList?.map((item, index) => {
              const isUserMessage = String(userId) === String(item.message_by);

              return (
                <div
                  key={index}
                  className={`flex items-end ${isUserMessage ? "justify-end" : "justify-start"}`}
                >
                  <div className="my-2 max-w-[90%] sm:max-w-[70%] md:max-w-[60%]">
                    {!isUserMessage && (
                      <div className="flex items-center gap-1 mb-1">
                        <img
                          src={item?.sendermessage?.profile_pic}
                          alt={item?.sendermessage?.full_name}
                          className="w-8 h-8 rounded-full object-cover mb-1"
                        />
                        <span className="text-xs text-center truncate">
                          {item?.sendermessage?.full_name}
                        </span>
                      </div>
                    )}

                    <div
                      className={`break-all w-fit px-3 py-2 text-sm rounded-[10px] ${
                        isUserMessage
                          ? "bg-[#FFF4DA] text-black rounded-tl-[10px] rounded-br-[10px]"
                          : "bg-slate-200 text-black rounded-tr-[10px] rounded-bl-[10px]"
                      }`}
                    >
                      {item.message_type === "Text" && (
                        <p>{item.message_text}</p>
                      )}
                      {item.message_type === "Image" && (
                        <Zoom>
                          <img
                            src={item.message_text}
                            alt={item?.message_text}
                            className={`w-[200px] h-[200px] object-cover rounded-md transition-opacity duration-300}`}
                          />
                        </Zoom>
                      )}
                      {item.message_type === "Video" && (
                        <VideoPlayer
                          src={item.message_text}
                          thumbnail={item.thumbnail}
                        />
                      )}
                      {item.message_type === "Document" && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 overflow-hidden w-[180px]">
                            <img
                              src={PDFicon}
                              alt="Document"
                              className="w-5 h-5 object-contain"
                            />
                            <span className="text-sm font-medium text-black truncate max-w-[150px]">
                              {getFileName(item.file_name)}
                            </span>
                          </div>
                          <a
                            href={item.message_text}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex  items-center p-1 border border-gray-500 rounded-full justify-center hover:bg-[#d2d7de] transition"
                          >
                            <IoMdDownload className="text-base text-[#000000b0]" />
                          </a>
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-[10px] flex ${!isUserMessage ? " justify-start" : "justify-end"} text-[#797c7b] pt-2`}
                    >
                      {item.displayTime}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex justify-center items-center h-[60vh] sm:h-[50vh] md:h-[55vh]">
              <p className="text-base font-semibold">Message Unavailable</p>
            </div>
          )}

          {showScrollButton && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 flex justify-center">
              <button
                onClick={scrollToBottom}
                className="rounded-full bg-[#293FE3] hover:bg-[#1c2db3] text-white shadow transition"
                aria-label="Scroll to bottom"
              >
                <IoArrowDownCircle size={32} />
              </button>
            </div>
          )}

          <InfiniteScroll
            dataLength={messageList.length}
            next={fetchMoreMessages}
            hasMore={hasMore}
            inverse={true}
            scrollableTarget="scrollableDiv"
          />
        </div>
      </div>

      {/* 
            <div className="flex-1 overflow-hidden relative">
                <div
                    ref={scrollRef}
                    id="scrollableDiv"
                    className="h-full w-full overflow-y-auto scroll p-2"
                    style={{
                        display: "flex",
                        flexDirection: "column-reverse",
                    }}
                >
                    {isLoading ? (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 sm:px-5 px-2 sm:py-5 py-3 space-y-4 md1:block hidden">
                                <div className="flex justify-start">
                                    <Skeleton circle width={40} height={40} className="mr-3" />
                                    <div>
                                        <Skeleton width={100} height={16} className="mb-2" />
                                        <Skeleton width={200} height={16} />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <div className="text-right">
                                        <Skeleton width={80} height={12} className="mb-2 ml-auto" />
                                        <Skeleton width={300} height={180} borderRadius={10} className="ml-auto" />
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <Skeleton width={200} height={200} className="rounded-[10px] ml-auto" />
                                </div>

                                <div className="flex justify-start">
                                    <Skeleton circle width={40} height={40} className="mr-3" />
                                    <div>
                                        <Skeleton width={120} height={16} className="mb-2" />
                                        <div className="border border-gray-300 rounded-lg px-4 py-3 w-[280px]">
                                            <Skeleton width={40} height={40} className="mb-2" />
                                            <Skeleton width={180} height={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 sm:px-5 px-2 sm:py-5 py-3 space-y-4 md1:hidden block">
                                <div className="flex items-start">
                                    <Skeleton circle width={30} height={30} className="mr-2" />
                                    <div>
                                        <Skeleton width={150} height={16} className="mb-1" />
                                        <Skeleton width={200} height={24} />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <div className="text-right">
                                        <Skeleton width={150} height={150} className="rounded-[10px] ml-auto" />
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Skeleton circle width={30} height={30} className="mr-2" />
                                    <div>
                                        <Skeleton width={150} height={16} className="mb-1" />
                                        <div className="border border-gray-100 mt-2 rounded-lg px-4 py-3 w-[250px]">
                                            <Skeleton width={35} height={35} className="mb-2" />
                                            <Skeleton width={140} height={14} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <div className="text-right">
                                        <Skeleton width={200} height={24} />
                                        <Skeleton width={100} height={12} className="mb-2 ml-auto" />
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Skeleton circle width={30} height={30} className="mr-2" />
                                    <div>
                                        <Skeleton width={150} height={16} className="mb-1" />
                                        <div className="flex justify-start">
                                            <Skeleton width={150} height={150} className="rounded-[10px] ml-auto" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <div className="border border-gray-100 mt-2 rounded-lg px-4 py-3 w-[250px]">
                                        <Skeleton width={35} height={35} className="mb-2" />
                                        <Skeleton width={140} height={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : messageList.length > 0 ? (
                        Object.entries(groupedMessages).map(([dateLabel, messages]) => {
                            const groupedDateMessages = [];
                            let currentImageGroup = [];

                            for (let i = 0; i < messages.length; i++) {
                                const message = messages[i];

                                if (message.message_type === 'Image') {
                                    currentImageGroup.push(message);
                                } else {
                                    if (currentImageGroup.length > 0) {
                                        groupedDateMessages.push({
                                            type: 'image_group',
                                            items: [...currentImageGroup],
                                            isUserMessage: String(userId) === String(currentImageGroup[0].message_by)
                                        });
                                        currentImageGroup = [];
                                    }
                                    groupedDateMessages.push({
                                        type: 'single',
                                        item: message,
                                        isUserMessage: String(userId) === String(message.message_by)
                                    });
                                }
                            }

                            if (currentImageGroup.length > 0) {
                                groupedDateMessages.push({
                                    type: 'image_group',
                                    items: [...currentImageGroup],
                                    isUserMessage: String(userId) === String(currentImageGroup[0].message_by)
                                });
                            }

                            return (
                                <div className="relative" key={dateLabel}>
                                    <div className="sticky w-fit m-auto top-0 z-10 bg-[#293FE3] text-center p-2 text-white rounded-md sm:text-xs text-[10px] font-medium">
                                        {dateLabel}
                                    </div>

                                    {groupedDateMessages.map((group, index) => {
                                        if (group.type === 'image_group') {
                                            const isUserMessage = group.isUserMessage;
                                            const images = group.items;
                                            const shouldGroup = images.length >= 2;
                                            const displayImages = shouldGroup ? images.slice(0, 2) : images;
                                            const remainingCount = shouldGroup ? images.length - 2 : 0;

                                            return (
                                                <div
                                                    key={`image-group-${index}`}
                                                    className={`flex items-end ${isUserMessage ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div className="my-2 max-w-[90%] sm:max-w-[70%] md:max-w-[60%]">
                                                        {!isUserMessage && (
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <img
                                                                    src={images[0]?.sendermessage?.profile_pic}
                                                                    alt={images[0]?.sendermessage?.full_name}
                                                                    className="w-8 h-8 rounded-full object-cover mb-1"
                                                                />
                                                                <span className="text-xs text-center truncate">
                                                                    {images[0]?.sendermessage?.full_name}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className={`break-all w-fit px-3 py-2 text-sm rounded-[10px] ${isUserMessage
                                                            ? "bg-[#FFF4DA] text-black rounded-tl-[10px] rounded-br-[10px]"
                                                            : "bg-slate-200 text-black rounded-tr-[10px] rounded-bl-[10px]"
                                                            }`}>
                                                            <div className="flex flex-wrap gap-2">
                                                                {displayImages.map((item, imgIndex) => (
                                                                    <div key={item.id} className="relative">
                                                                        <Zoom>
                                                                            <img
                                                                                src={item.message_text}
                                                                                alt={item?.message_text}
                                                                                className="w-[200px] h-[200px] object-cover rounded-md transition-opacity duration-300"
                                                                            />
                                                                        </Zoom>
                                                                        {shouldGroup && imgIndex === 2 && remainingCount > 0 && (
                                                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md cursor-pointer"
                                                                                onClick={() => {
                                                                                    console.log("Show all images", images);
                                                                                }}>
                                                                                <span className="text-white text-2xl font-bold">+{remainingCount}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className={`text-[10px] flex ${!isUserMessage ? " justify-start" : "justify-end"} text-[#797c7b] pt-2`}>
                                                            {images[0].displayTime}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            const item = group.item;
                                            const isUserMessage = group.isUserMessage;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`flex items-end ${isUserMessage ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div className="my-2 max-w-[90%] sm:max-w-[70%] md:max-w-[60%]">
                                                        {!isUserMessage && (
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <img
                                                                    src={item?.sendermessage?.profile_pic}
                                                                    alt={item?.sendermessage?.full_name}
                                                                    className="w-8 h-8 rounded-full object-cover mb-1"
                                                                />
                                                                <span className="text-xs text-center truncate">
                                                                    {item?.sendermessage?.full_name}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className={`break-all w-fit px-3 py-2 text-sm rounded-[10px] ${isUserMessage
                                                            ? "bg-[#FFF4DA] text-black rounded-tl-[10px] rounded-br-[10px]"
                                                            : "bg-slate-200 text-black rounded-tr-[10px] rounded-bl-[10px]"
                                                            }`}>
                                                            {item.message_type === "Text" && <p>{item.message_text}</p>}
                                                            {item.message_type === "Image" && (
                                                                <Zoom>
                                                                    <img
                                                                        src={item.message_text}
                                                                        alt={item?.message_text}
                                                                        className="w-[200px] h-[200px] object-cover rounded-md transition-opacity duration-300"
                                                                    />
                                                                </Zoom>
                                                            )}
                                                            {item.message_type === "Video" && (
                                                                <VideoPlayer src={item.message_text} thumbnail={item.thumbnail} />
                                                            )}
                                                            {item.message_type === "Document" && (
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-3 overflow-hidden w-[180px]">
                                                                        <img
                                                                            src={PDFicon}
                                                                            alt="Document"
                                                                            className="w-5 h-5 object-contain"
                                                                        />
                                                                        <span className="text-sm font-medium text-black truncate max-w-[150px]">
                                                                            {getFileName(item.file_name)}
                                                                        </span>
                                                                    </div>
                                                                    <a
                                                                        href={item.message_text}
                                                                        download
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center p-1 border border-gray-500 rounded-full justify-center hover:bg-[#d2d7de] transition"
                                                                    >
                                                                        <IoMdDownload className="text-base text-[#000000b0]" />
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={`text-[10px] flex ${!isUserMessage ? " justify-start" : "justify-end"} text-[#797c7b] pt-2`}>
                                                            {item.displayTime}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex justify-center items-center h-[60vh] sm:h-[50vh] md:h-[55vh]">
                            <p className="text-base font-semibold">Message Unavailable</p>
                        </div>
                    )}

                    {showScrollButton && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 flex justify-center">
                            <button
                                onClick={scrollToBottom}
                                className="rounded-full bg-[#293FE3] hover:bg-[#1c2db3] text-white shadow transition"
                                aria-label="Scroll to bottom"
                            >
                                <IoArrowDownCircle size={32} />
                            </button>
                        </div>
                    )}

                    <InfiniteScroll
                        dataLength={messageList.length}
                        next={fetchMoreMessages}
                        hasMore={hasMore}
                        inverse={true}
                        scrollableTarget="scrollableDiv"
                    />
                </div>
            </div> */}

      <div className="w-full md:p-4">
        {previews.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 mb-4 border rounded-lg p-2">
            {previews.map((item, index) => (
              <div
                key={index}
                className="relative group border rounded shadow p-1 overflow-hidden"
              >
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 z-10 text-white bg-[#293FE3] bg-opacity-80 rounded-full p-0.5
                                    hidden group-hover:block transition duration-300 ease-in-out hover:bg-opacity-90"
                >
                  <RxCrossCircled className="text-lg" />
                </button>

                {item.type === "image" && (
                  <Zoom>
                    <img
                      src={item.url}
                      alt="Preview"
                      className=" w-24 h-24 object-cover rounded"
                    />
                  </Zoom>
                )}

                {item.type === "video" && (
                  <div className="relative  w-24 h-24">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover rounded"
                      poster={
                        previews.find((thumb) => thumb.type === "image")?.url ||
                        ""
                      }
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <FaRegCirclePlay className="text-white text-xl" />
                    </div>
                  </div>
                )}

                {item.type === "document" && (
                  <div className="flex flex-col items-center w-24">
                    <div className="relative w-24 h-20">
                      <img
                        src={PDFicon}
                        className="w-full h-full py-2 object-contain rounded"
                        alt="Document Preview"
                      />
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center rounded hover:bg-opacity-70 transition"
                      >
                        <HiEye className="text-white text-lg" />
                      </a>
                    </div>
                    <span className="text-[10px] text-center break-words p-1 truncate max-w-full">
                      {item.file?.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setOpen(!open)}>
              <FiPlus className="text-[#6F6F6F] text-2xl" />
            </button>

            {open && (
              <div className="absolute z-50 bottom-full mb-2 w-44 bg-white border rounded-lg shadow-md text-sm">
                <label
                  htmlFor="imageUpload"
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer
                                    ${isTypeAlreadySelected("image") ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                >
                  <MdImage className="text-blue-500 text-lg" />
                  Image
                </label>
                {/* 
                                <label
                                    htmlFor="videoUpload"
                                    className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer
                                    ${isTypeAlreadySelected("video") ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                                >
                                    <MdVideoLibrary className="text-red-500 text-lg" />
                                    Video
                                </label> */}
                <label
                  htmlFor="docUpload"
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer
                                    ${isTypeAlreadySelected("document") ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                >
                  <HiDocumentText className="text-green-600 text-lg" />
                  Document
                </label>

                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={isTypeAlreadySelected("image")}
                  onChange={(e) => handleFiles(e.target.files, "image")}
                />
                {/* <input
                                    id="videoUpload"
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    className="hidden"
                                    disabled={isTypeAlreadySelected("video")}
                                    onChange={(e) => handleFiles(e.target.files, "video")}
                                /> */}
                <input
                  id="docUpload"
                  type="file"
                  accept=".pdf, .jpg, .jpeg, .png"
                  multiple
                  className="hidden"
                  disabled={isTypeAlreadySelected("document")}
                  onChange={(e) => handleFiles(e.target.files, "document")}
                />
              </div>
            )}
          </div>

          <div className="w-full flex items-center gap-2">
            <textarea
              rows={1}
              placeholder="Type..."
              value={input}
              disabled={
                isTypeAlreadySelected("Image") ||
                isTypeAlreadySelected("Video") ||
                isTypeAlreadySelected("Document")
              }
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 resize-none w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#293fe3a3]"
            />
          </div>

          <div className="min-w-[45px] h-[45px]">
            <button
              disabled={loader || (!input && previews.length === 0)}
              onClick={handleSend}
              className="w-[45px] h-[45px] flex items-center justify-center rounded-xl bg-[#293fe3a3] disabled:opacity-50"
            >
              {loader ? (
                <Oval
                  height={20}
                  width={20}
                  color="#ffffff"
                  secondaryColor="#cbd5e0"
                  strokeWidth={4}
                  strokeWidthSecondary={4}
                  visible={true}
                />
              ) : (
                <img
                  src={sendIcon}
                  className="object-cover rounded-xl h-[45px]"
                  alt="Send"
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
