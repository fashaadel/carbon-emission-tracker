import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register necessary components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartComponent = ({ carbonData }) => {
  const labels = carbonData.map(data => data.id);
  const values = carbonData.map(data => parseFloat(data.value));

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Carbon Emissions',
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)'
        ],
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
        data: values,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Carbon Emissions Distribution',
      },
    },
  };

  return (
    <div>
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChartComponent;