import { createRef, useEffect, useRef } from "react";
import ChartJs from "chart.js/auto";

const init = (el, props) => {
  const canvas = el?.getContext("2d");
  if (canvas) {
    const chart = new ChartJs(canvas, {
      type: props.type,
      data: props.data,
      options: props.options,
    });

    el.instance = chart;
  }
};

function Chart({ type = "line", data = {}, options = {}, width = "auto", height = "auto", getRef = () => { }, className = "", ...computedProps }) {
  const initialRender = useRef(true);
  const chartRef = createRef();

  useEffect(() => {
    if (initialRender.current) {
      getRef(chartRef.current);
      if (chartRef.current) {
        init(chartRef.current, { type, data, options });
      }
      initialRender.current = false;
    } else {
      if (chartRef.current) {
        chartRef.current.instance.data = data;
        chartRef.current.instance.options = {
          ...options,
          animation: false,
          responsiveAnimationDuration: 0,
          animations: {
            colors: false,
            x: false,
            y: false,
          },
          transitions: {
            active: {
              animation: false,
            },
          },
        };
        chartRef.current.instance.update();
      }
    }
  }, [data, options]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
      <canvas {...computedProps} ref={chartRef}></canvas>
    </div>
  );
}

export default Chart;
