import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const GrowthChartDoctor = ({ parentId, childId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch chart data for the specified child
  useEffect(() => {
    if (!childId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/get_chart_doctor_view?parent_id=${parentId}&child_id=${childId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await response.json();
        // alert(JSON.stringify(data, null, 2));
        console.log('API Response:', data); // Log the response for debugging

        if (data.success) {
          // Check if all head_circumference values are null
          const allHeadCircumferenceNull = Object.values(data.child_data).every(
            (dataPoint) => dataPoint.head_circumference === null
          );
          // Set the chart data, also indicating if head circumference chart should be displayed
          setChartData({
            ...data,
            allHeadCircumferenceNull, // Store the check result in the state to conditionally render the chart
          });
          setLoading(false);
        } else {
          setError(data.message || 'Failed to fetch chart data');
          setLoading(false);
        }
      } catch (err) {
        console.error('Fetch Error:', err); // Log any fetch errors
        setError('Failed to fetch chart data');
        setLoading(false);
      }
    };

    fetchData();
  }, [childId, parentId]);

  const createChartData = (childData, percentileData, label) => {
    const labels = percentileData.map(d => d.Month);
    const yAxisLabel = label === 'weight' ? 'Weight (kg)' : label === 'height' ? 'Height (cm)' : 'Head Circumference (cm)';
    const yAxisRange = label === 'weight' ? [2, 20] : label === 'height' ? [42, 96] : [30, 54];
    const xAxisRange = label === 'weight' || label === 'head_circumference' ? [0, 36] : [0, 24];

    // Filter out unwanted percentiles
    const validPercentiles = ['P01', 'P15', 'P85', 'P97', 'P999'];
    const percentileColumns = Object.keys(percentileData[0]).filter(key => key.startsWith('P') && !validPercentiles.includes(key));
    const percentileDatasets = percentileColumns.map((column) => ({
      label: `Percentile (${column})`,
      data: percentileData.map(d => ({ x: d.Month, y: d[column] })),
      borderColor: 'lightblue',
      borderWidth: 1,
      fill: false,
      pointRadius: 0, // Hide points for percentile curves
      borderDash: [],
    }));

    const childDataPoints = Object.entries(childData).map(([age, values]) => ({ x: parseFloat(age), y: values[label] }));
    const childDataLine = {
      label: 'Child Data',
      data: childDataPoints,
      borderColor: 'black',
      backgroundColor: 'black',
      fill: false,
      pointRadius: 3,
      showLine: true,
    };

    return {
      labels,
      datasets: [...percentileDatasets, childDataLine],
      yAxisLabel, // Pass the label for use in tooltips
    };
  };

  const interpolatePercentile = (age, value, percentileData) => {
    for (let i = 0; i < percentileData.length - 1; i++) {
      const point1 = percentileData[i];
      const point2 = percentileData[i + 1];
      
      if (point1.Month <= age && age <= point2.Month) {
        const percentiles = Object.keys(point1).filter(k => k.startsWith('P'));
  
        for (let j = 0; j < percentiles.length - 1; j++) {
          const p1Value1 = point1[percentiles[j]];
          const p1Value2 = point2[percentiles[j]];
          const p2Value1 = point1[percentiles[j + 1]];
          const p2Value2 = point2[percentiles[j + 1]];
  
          if (p1Value1 <= value && value <= p2Value1) {
            const x1 = point1.Month;
            const x2 = point2.Month;
            const y1 = p1Value1;
            const y2 = p1Value1;
  
            const percentileStart = parseFloat(percentiles[j].substring(1));
            const percentileEnd = parseFloat(percentiles[j + 1].substring(1));
            const t = (value - y1) / (y2 - y1);
            const interpolatedPercentile = percentileStart + t * (percentileEnd - percentileStart);
  
            return `P${interpolatedPercentile.toFixed(1)}`;
          }
        }
      }
    }
  
    return 'N/A';
  };  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const { child_data, weight_data, height_data, head_circumference_data } = chartData;
  const weightChartData = createChartData(child_data, weight_data, 'weight');
  const heightChartData = createChartData(child_data, height_data, 'height');
  const headCircumferenceChartData = createChartData(child_data, head_circumference_data, 'head_circumference');

  const chartOptions = (yAxisLabel, yAxisRange, xAxisRange) => ({
    plugins: {
      legend: {
        display: true,
        labels: {
          filter: (item) => item.text === 'Percentile' || item.text === 'Child Data',
          usePointStyle: true,
          generateLabels: (chart) => {
            const data = chart.data;
            const labels = data.datasets.map((dataset, i) => {
              if (dataset.label.startsWith('Percentile')) {
                return {
                  text: 'Percentile',
                  fillStyle: dataset.borderColor,
                  strokeStyle: dataset.borderColor,
                  pointStyle: 'line',
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i,
                };
              } else if (dataset.label === 'Child Data') {
                return {
                  text: dataset.label,
                  fillStyle: dataset.borderColor,
                  strokeStyle: dataset.borderColor,
                  pointStyle: 'circle',
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i,
                };
              }
              return {
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                pointStyle: dataset.pointStyle || 'line',
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i,
              };
            });
            return labels.filter((label, index, self) =>
              index === self.findIndex((l) => l.text === label.text)
            );
          },
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        filter: function (tooltipItem) {
          const datasetLabel = tooltipItem.dataset.label;
          
          // If the hovered dataset is 'Child Data', always show its tooltip
          if (datasetLabel === 'Child Data') {
            return true;
          }
          
          // Check if 'Child Data' or 'Predicted Value' exists at the same point
          const childDataset = tooltipItem.chart.data.datasets.find(d => d.label === 'Child Data');
          // const predictedDataset = tooltipItem.chart.data.datasets.find(d => d.label === 'Predicted Value');
      
          const childPointExists = childDataset ? childDataset.data.some(point => 
            point.x === tooltipItem.parsed.x && point.y === tooltipItem.parsed.y
          ) : false;
          
          // const predictedPointExists = predictedDataset ? predictedDataset.data.some(point => 
          //   point.x === tooltipItem.parsed.x && point.y === tooltipItem.parsed.y
          // ) : false;
      
          // If 'Child Data'exists at this point, hide other tooltips
          if (childPointExists) {
            return false;
          }
      
          // Show tooltip for other datasets if no overlapping 'Child Data' or 'Predicted Value' point
          return true;
        },
        callbacks: {
          title: () => '', // Hide the title
          label: (context) => {
            const label = context.dataset.label || '';
            const yAxisValue = context.parsed.y;
            const xAxisValue = context.parsed.x;
            

            // Determine which data to use (weight, height, or head circumference)
            let percentile = 'N/A';
            // Check dataset label to determine which data to pass
            if (context.chart.options.scales.y.title.text === 'Weight (kg)') {
              percentile = interpolatePercentile(xAxisValue, yAxisValue, weight_data);
            } else if (context.chart.options.scales.y.title.text === 'Height (cm)') {
              percentile = interpolatePercentile(xAxisValue, yAxisValue, height_data);
            } else if (context.chart.options.scales.y.title.text === 'Head Circumference (cm)') {
              percentile = interpolatePercentile(xAxisValue, yAxisValue, head_circumference_data);
            }

            if (label.startsWith('Percentile')) {
              const percentileMatch = label.match(/\(P\d+\)/);
              const percentile = percentileMatch ? percentileMatch[0].replace(/[()]/g, '') : 'N/A';
              return `(${percentile}, ${xAxisValue}, ${yAxisValue})`;
            } else if (label === 'Child Data') {
              return `(${percentile}, ${xAxisValue}, ${yAxisValue})`;
            }
            return `${label}: (${xAxisValue}, ${yAxisValue})`;
          },
          labelColor: (context) => {
            const label = context.dataset.label;
            let backgroundColor = context.dataset.borderColor;
            return {
              borderColor: backgroundColor,
              backgroundColor: backgroundColor,
            };
          },
        },
      },                       
    },
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: xAxisRange[1],
        title: {
          display: true,
          text: 'Age (in months)',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        ticks: {
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      y: {
        min: yAxisRange[0],
        max: yAxisRange[1],
        title: {
          display: true,
          text: yAxisLabel,
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        ticks: {
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
  });

  return (
    <div style={{ width: '75%', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Child Growth Percentile Charts</h1>
      <h2 style={{ textAlign: 'center' }}>Weight Chart</h2>
      <Line
        data={weightChartData}
        options={chartOptions(weightChartData.yAxisLabel, [2, 20], [0, 36])}
      />
      <div style={{ height: '3rem' }}></div> {/* 3-4 lines gap */}
      <h2 style={{ textAlign: 'center' }}>Height Chart</h2>
      <Line
        data={heightChartData}
        options={chartOptions(heightChartData.yAxisLabel, [42, 96], [0, 24])}
      />
      <div style={{ height: '3rem' }}></div> {/* 3-4 lines gap */}
      {
        !chartData.allHeadCircumferenceNull && (
          <>
            <h2 style={{ textAlign: 'center' }}>Head Circumference Chart</h2>
            <Line
              data={headCircumferenceChartData}
              options={chartOptions(headCircumferenceChartData.yAxisLabel, [30, 54], [0, 36])}
            />
            <div style={{ height: '3rem' }}></div> {/* 3-4 lines gap */}
          </>
        )
      }
    </div>
  );
};

export default GrowthChartDoctor;