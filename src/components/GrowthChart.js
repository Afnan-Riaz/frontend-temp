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

const GrowthChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]); // List of distinct children
  const [selectedChild, setSelectedChild] = useState(null); // Track selected child

  // Fetch profile including distinct children list
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        if (data.success && data.user_type === 'parent') {
          const childrenList = data.user.children;

          if (childrenList.length === 0) {
              setLoading(false); // Stop loading if no children are found
              setError('No children found for this parent.');
              return; // No need to proceed further if no children are found
          }
          setChildren(data.user.children); // Set children list
          setSelectedChild(data.user.children[0]?.child_id); // Automatically select first child
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Error fetching profile.');
      }
    };

    fetchProfile();
  }, []);

  // Fetch chart data for the selected child
  useEffect(() => {
    if (!selectedChild) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/chart?child_id=${selectedChild}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
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
  }, [selectedChild]);

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

    // const predictedDataPoint = predictedValue ? [{ x: chartData.next_age, y: predictedValue }] : [];
    // const predictedData = {
    //   label: 'Predicted Value',
    //   data: predictedDataPoint,
    //   borderColor: 'red',
    //   backgroundColor: 'red',
    //   fill: false,
    //   pointRadius: 3, // Smaller dot for predicted value
    //   showLine: false,
    // };

    // let dottedLineData = [];
    // if (predictedDataPoint.length > 0 && childDataPoints.length > 0) {
    //   const lastChildDataPoint = childDataPoints[childDataPoints.length - 1];
    //   dottedLineData = [
    //     { x: lastChildDataPoint.x, y: lastChildDataPoint.y },
    //     ...predictedDataPoint,
    //   ];
    // }

    // const dottedLine = {
    //   label: '',
    //   data: dottedLineData,
    //   borderColor: 'black',
    //   borderDash: [5, 5],
    //   fill: false,
    //   showLine: true,
    // };

    return {
      labels,
      // datasets: [...percentileDatasets, childDataLine, predictedData, dottedLine],
      datasets: [...percentileDatasets, childDataLine],
      yAxisLabel, // Pass the label for use in tooltips
    };
  };

  const calculatePercentile = (y, percentileData, x) => {
    const percentilesForX = percentileData.find(d => d.Month === x);
  
    if (percentilesForX) {
      const percentileColumns = Object.keys(percentilesForX).filter(key => key.startsWith('P'));
  
      for (let i = 0; i < percentileColumns.length - 1; i++) {
        const p1 = percentileColumns[i];
        const p2 = percentileColumns[i + 1];
  
        const y1 = percentilesForX[p1];
        const y2 = percentilesForX[p2];
  
        if (y >= y1 && y <= y2) {
          const interpolatedP = parseFloat(p1.slice(1)) + ((y - y1) / (y2 - y1)) * (parseFloat(p2.slice(1)) - parseFloat(p1.slice(1)));
          return `P${interpolatedP.toFixed(1)}`;
        }
      }
  
      // Fallback to nearest percentile
      const nearest = percentileColumns.reduce((prev, curr) => {
        return Math.abs(percentilesForX[curr] - y) < Math.abs(percentilesForX[prev] - y) ? curr : prev;
      });
      return `P${parseFloat(nearest.slice(1)).toFixed(0)}`;
    }
  
    return null;
  };

  const interpolatePercentile = (age, value, percentileData) => {
    for (let i = 0; i < percentileData.length - 1; i++) {
      const point1 = percentileData[i];
      const point2 = percentileData[i + 1];
  
      // Ensure age lies between point1 and point2
      if (point1.Month <= age && age <= point2.Month) {
        const percentiles = Object.keys(point1).filter(k => k.startsWith('P')).sort((a, b) => parseFloat(a.slice(1)) - parseFloat(b.slice(1)));
  
        for (let j = 0; j < percentiles.length - 1; j++) {
          const p1Start = parseFloat(percentiles[j].slice(1)); // Start percentile (e.g., 25)
          const p1End = parseFloat(percentiles[j + 1].slice(1)); // End percentile (e.g., 50)
  
          const y1Start = point1[percentiles[j]];
          const y2Start = point2[percentiles[j]];
          const y1End = point1[percentiles[j + 1]];
          const y2End = point2[percentiles[j + 1]];
  
          // Interpolate yStart and yEnd for the given age
          const interpolatedYStart = y1Start + ((age - point1.Month) / (point2.Month - point1.Month)) * (y2Start - y1Start);
          const interpolatedYEnd = y1End + ((age - point1.Month) / (point2.Month - point1.Month)) * (y2End - y1End);
  
          // Check if the value falls between the interpolated bounds
          if (interpolatedYStart <= value && value <= interpolatedYEnd) {
            // Linear interpolation to find the exact percentile
            const t = (value - interpolatedYStart) / (interpolatedYEnd - interpolatedYStart);
            const interpolatedPercentile = p1Start + t * (p1End - p1Start);
            return `P${interpolatedPercentile.toFixed(1)}`;
          }
        }
      }
    }
  
    return 'N/A'; // Return null if no percentile found
  };  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Sorry! You have not saved any growth data for this child yet.</div>;
  if (children.length === 0) {
    return <div>No children found for the current user.</div>;
}
  // const { child_data, weight_data, height_data, head_circumference_data, predicted_weight, predicted_height, predicted_head_circumference } = chartData;
  const { child_data, weight_data, height_data, head_circumference_data } = chartData;
  const weightChartData = createChartData(child_data, weight_data, 'weight');
  const heightChartData = createChartData(child_data, height_data, 'height');
  const headCircumferenceChartData = createChartData(child_data, head_circumference_data, 'head_circumference');

  const chartOptions = (yAxisLabel, yAxisRange, xAxisRange) => ({
    plugins: {
      legend: {
        display: true,
        labels: {
          // filter: (item) => item.text === 'Percentile' || item.text === 'Child Data' || item.text === 'Predicted Value',
          filter: (item) => item.text === 'Percentile' || item.text === 'Child Data',
          usePointStyle: true,
          generateLabels: (chart) => {
            const data = chart.data;
            const labels = data.datasets.map((dataset, i) => {
              const size = 1; // Adjust this size to your preference
              if (dataset.label.startsWith('Percentile')) {
                return {
                  text: 'Percentile',
                  fillStyle: dataset.borderColor,
                  strokeStyle: dataset.borderColor,
                  lineCap: 'butt',
                  lineDash: dataset.borderDash || [],
                  lineDashOffset: 0,
                  lineJoin: 'miter',
                  pointStyle: 'line',
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i,
                };
              } else if (dataset.label === 'Child Data') {
                return {
                  text: dataset.label,
                  fillStyle: dataset.borderColor,
                  strokeStyle: dataset.borderColor,
                  lineCap: 'butt',
                  lineDash: dataset.borderDash || [],
                  lineDashOffset: 0,
                  lineJoin: 'miter',
                  pointStyle: 'circle',
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i,
                  pointRadius: size,
                  pointHitRadius: size,
                };
              }
              return {
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                lineCap: 'butt',
                lineDash: dataset.borderDash || [],
                lineDashOffset: 0,
                lineJoin: 'miter',
                pointStyle: dataset.pointStyle || 'line',
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i,
              };
            });
          
            // Deduplicate the "Percentile" label
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

      {/* Dropdown for selecting child */}
      <div className="form-group centered-dropdown" style={{ marginBottom: '2rem' }}>
        <label htmlFor="childSelect">Select Child: </label>
        <select id="childSelect" value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
          {children.map((child) => (
            <option key={child.child_id} value={child.child_id}>
              {child.child_first_name} {child.child_last_name}
            </option>
          ))}
        </select>
      </div>

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

export default GrowthChart;