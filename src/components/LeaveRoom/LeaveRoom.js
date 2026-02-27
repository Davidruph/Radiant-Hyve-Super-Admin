import { Socket } from "../Socket/Socket";

export const leaveChatRoom = (school_id) => {
    if (Socket && school_id) {
        Socket.emit("left_group",
            {
                "school_id": school_id,
                "user_id": school_id
            });
        Socket.off("connect");
        console.log(`Left room: ${school_id}`);
    }
};
