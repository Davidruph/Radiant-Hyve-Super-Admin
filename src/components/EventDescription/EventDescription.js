import React, { useState } from "react";

const EventDescription = ({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleReadMore = () => setIsExpanded(!isExpanded);

    const isLong = description.length > 500;

    return (
        <div>
            <p
                className={`text-[#1F1F1F] font-normal md:text-[15px] text-sm mt-3 ${!isExpanded && isLong ? "line-clamp-3" : ""
                    }`}
            >
                {description}
            </p>

            {isLong && (
                <button
                    onClick={toggleReadMore}
                    className="text-blue-600 text-sm mt-1 focus:outline-none"
                >
                    {isExpanded ? "Read less" : "Read more"}
                </button>
            )}
        </div>
    );
};

export default EventDescription;
    