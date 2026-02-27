import Chart from "../../base-component/Chart/Chart";

function Main({ width = "auto", height = "auto", className = "", data = [] }) {
  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    datasets: [
      {
        label: "Days",
        data: data.length ? data : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#293FE3",
        barThickness: 20,
        borderRadius: 5
      }
    ]
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12
          },
          color: "#64748B"
        },
        grid: {
          display: false,
          drawBorder: false
        }
      },
      y: {
        min: 0,
        max: 30,
        ticks: {
          stepSize: 5,
          font: {
            size: 12
          },
          color: "#64748B",
          callback: function (value) {
            return `${value} day${value !== 1 ? "s" : ""}`;
          }
        },
        grid: {
          display: true,
          color: "#CBD5E1",
          drawBorder: false,
          borderDash: [5, 5]
        }
      }
    }
  };

  return (
    <Chart
      type="bar"
      width={width}
      height={height}
      data={chartData}
      options={options}
      className={className}
    />
  );
}

export default Main;
