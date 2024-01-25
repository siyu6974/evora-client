import { useState, useEffect } from 'react';
import { getTemperature } from "../apiClient";

import { Line } from 'react-chartjs-2';
import "chart.js/auto";

/**
 * Displays a button to get and show the temperature of the camera
 */
function GetTemp({currTemp, setCurrTemp, isDisabled}) {


  let NUM_OF_DATA_POINTS = 20;

  let tempMessage = <span className='tempMessage'>Current Temperature: -999 °C</span>;

  const initialize_array = (num) => {
    let newArray = [];
    for(let i = 0; i < num; i++){
      newArray.push(0);
    }
    return newArray
  }

  const [dateArray, setDateArray] = useState(() => {
    const initialState = initialize_array(NUM_OF_DATA_POINTS);
    return initialState;
  });

  const [tempDataArray, setTempDataArray] = useState(() => {
    const initialState = initialize_array(NUM_OF_DATA_POINTS);
    return initialState;
  });

  const [buttonText, setButtonText] = useState('Show');
  const [graphDisplay, setGraphDisplay] = useState('none');
  const [tempGraphButtonText, setTempGraphButtonText] = useState('Turn ON');
  const [tempGraphButtonClass, setTempGraphButtonClass] = useState('tempGraphOFF');

  //Graph data collection loop
  useEffect(() => {
    let TIMER; // in ms
    if(tempGraphButtonText !== 'Turn ON'){
      TIMER = 3000;
    } else {
      TIMER = 30000;
    }
    const interval = setInterval(() => {
      const temperaturePromise = getTemperature();
      temperaturePromise.then(val => {
        const temperature = JSON.parse(val);
        const tempNum = parseFloat(temperature["temperature"]);
        const rounded = Math.round((tempNum + Number.EPSILON) * 100) / 100;
        setCurrTemp(rounded.toString())

        setTempDataArray(tempDataArray => [...tempDataArray, tempNum])
        setDateArray(dateArray => [...dateArray, new Date().toTimeString().substring(3, 8)])
      })
      if(dateArray.length > NUM_OF_DATA_POINTS){
        setDateArray(dateArray.slice(1, NUM_OF_DATA_POINTS + 1))
      }
      if(tempDataArray.length > NUM_OF_DATA_POINTS){
        setTempDataArray(tempDataArray.slice(1, NUM_OF_DATA_POINTS + 1));
      }
    }, TIMER);
    return () => clearInterval(interval);
  }, [dateArray, tempDataArray, tempGraphButtonText, setCurrTemp, NUM_OF_DATA_POINTS]);

  async function callGetTemperature() {
    const temperature = JSON.parse(await getTemperature());
    // Round the number
    const tempNum = parseFloat(temperature["temperature"]);
    const rounded = Math.round((tempNum + Number.EPSILON) * 100) / 100;

    setCurrTemp(rounded.toString())
  }

  if(currTemp != null){
    tempMessage = <span className='tempMessage'>Current Temperature: {currTemp} °C</span>
  }

  const data = {
    labels: dateArray,
    datasets: [
      {
        data: tempDataArray,
        borderColor: "#0ed100",
        tension: 0.1,
        backgroundColor: "white",
      },
    ],
  };

  const options = {
    plugins: {
        legend: {
          display: false
        }
      },
    scales: {
      x: {
        grid: {
          color: 'grey'
        },
        ticks: {
          color: 'white'
        }
      },
      y: {
        max: 30,
        min: -100,
        grid: {
          color: 'grey'
        },
        ticks: {
          stepSize: 5,
          color: 'white'
        }
      }
    }
  };

  const graphButtonHandler = () => {
    if(buttonText === 'Show'){
      setButtonText('Hide');
      setGraphDisplay('block');
    } else {
      setButtonText('Show');
      setGraphDisplay('none');
    }
  }

  const graphOnOffHandler = () => {
    if(tempGraphButtonClass === 'tempGraphOFF'){
      setTempGraphButtonClass('tempGraphON');
      setTempGraphButtonText('Turn OFF');
    } else {
      setTempGraphButtonClass('tempGraphOFF');
      setTempGraphButtonText('Turn ON');
    }
  }

  return (
    <fieldset className="Temperature" disabled={isDisabled}>
      <label>Get Temperature</label>
      <button onClick={callGetTemperature}>Get</button>
      <button onClick={graphButtonHandler} style={{ width:'48px'}}>{buttonText}</button>
      {tempMessage}
      <div className="graphContainer" style={{ display: graphDisplay}}>
        <button onClick={graphOnOffHandler}className={tempGraphButtonClass}>{tempGraphButtonText}</button>
        <p>Turning on this graph will enable auto-updating for the current temperature even if hidden</p>
        <Line data={data} options={options}/>
      </div>
    </fieldset>
  );
}

export default GetTemp;
  