import Chart from "../../base-component/Chart/Chart";

function Main({ width = "auto", height = "auto", className = "" }) {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Present",
        barThickness: 23,
        maxBarThickness: 15,
        data: [1100, 1100, 1200, 1500, 1000, 2000],
        backgroundColor: "#9810FA"
      },
      {
        label: "Absent",
        barThickness: 15,
        maxBarThickness: 20,
        data: [300, 1500, 600, 1900, 460, 1300],
        backgroundColor: "#FFB30B"
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
        ticks: {
          font: {
            size: 12
          },
          color: "#64748B",
          stepSize: 500,
          callback: function (value) {
            const labels = [0, 100, 500, 1000, 1500, 2000];
            return labels.includes(value) ? value : "";
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
      data={data}
      options={options}
      className={className}
    />
  );
}

export default Main;
