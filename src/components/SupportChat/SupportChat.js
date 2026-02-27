import React, { useRef } from "react";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";

function SupportChat() {
    const tawkRef = useRef();
    const onLoad = () => {
        console.log("onLoad works");
    };
    return (
        <div>
            <TawkMessengerReact
                ref={tawkRef}
                propertyId="6846da706cbc18190d4c208f"
                widgetId="1itacaila"
                onLoad={onLoad}
            />
        </div>
    );
}

export default SupportChat;
