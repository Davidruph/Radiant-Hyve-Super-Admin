import { useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoPlayer = ({ src, thumbnail }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;

        if (video) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(video);

                return () => {
                    hls.destroy();
                };
            }
        }
    }, [src]);

    return (
        <video
            ref={videoRef}
            controls
            poster={thumbnail}
            className="rounded-md w-[200px] h-[200px] object-cover"
        />
    );
};

export default VideoPlayer;
