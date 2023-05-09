
class Chart {
// Constructor
constructor() {
  // Set the margin and create the SVG element
  this.margin = { top: 20, right: 0, bottom: 0, left: 20 };
  this.svg = d3.select("#chart")
    .append("svg")
    .attr("width", 1000 + this.margin.left + this.margin.right)
    .attr("height", 500 + this.margin.top + this.margin.bottom);

  // Initialize instance variables
  this.intervalId;
  this.isSorting = false;
  this.duration = 0;
  this.chartData = null;
  this.controller = null;
}

// Update the chart with new data
async updateChart() {
  // Create a new abort signal and wait for it to be created
  await this.createNewAbortSignal();

  // Clear the interval and set the sorting flag to false
  this.isSorting = false;
  if (this.intervalId) {
    clearInterval(this.intervalId);
    this.isSorting = false;
  }

  // Generate random data and calculate chart dimensions
  let data = [];
  for (let i = 0; i < slider.value; i++) {
    data.push(Math.floor(Math.random() * 50));
  }
  const numBars = data.length;
  const svgWidth = 1000;
  const padding = 50;
  const barWidth = (svgWidth - padding * 2) / numBars;

  // Select all rectangles and bind the data
  const rects = this.svg.selectAll("rect")
    .data(data)
    .attr("class", "bar");

  // Add new rectangles for any new data points
  rects.enter()
    .append("rect")
    .attr("x", (d, i) => padding + i * barWidth)
    .attr("y", d => 300 - Math.max(d * 3, 1))
    .attr("width", barWidth - 2)
    .attr("height", d => Math.max(d * 3, 1))
    .attr("fill", "blue");

  // Update existing rectangles with new data values
  rects.transition()
    .duration(1000)
    .attr("x", (d, i) => padding + i * barWidth)
    .attr("y", d => 300 - Math.max(d * 3, 1))
    .attr("width", barWidth - 2)
    .attr("height", d => Math.max(d * 3, 1));

  // Remove any rectangles that are no longer needed
  rects.exit()
    .remove();

  // Select all labels and bind the data
  const labels = this.svg.selectAll("text")
    .data(data);

  // Remove labels if there are too many data points
  if (data.length > 50) {
    this.svg.selectAll("text").remove();
  }
  // Add new labels for any new data points
  else {
    labels.enter()
      .append("text")
      .attr("x", (d, i) => padding + i * barWidth + barWidth / 2)
      .attr("y", d => 295 - Math.max(d * 3, 1))
      .attr("text-anchor", "middle")
      .text(d => d);

    // Update existing labels with new data values
    labels.transition()
      .duration(1000)
      .attr("x", (d, i) => padding + i * barWidth + barWidth / 2)
      .attr("y", d => 295 - Math.max(d * 3, 1))
      .text(d => d);

    // Remove any labels that are no longer needed
    labels.exit()
      .remove();
  }

  // Store the chart data in an object and return it
  this.chartData = { data, rects, labels, barWidth, padding};
  return this.chartData;
}
  
    async randomizeData() {
      let {data, rects, labels, barWidth, padding} = this.chartData;
    
      // Wait for the creation of a new abort signal
      await this.createNewAbortSignal();
    
      // Clear the interval and set the sorting flag to false
      clearInterval(this.intervalId);
      this.isSorting = false;
    
      // Randomize the data using the Fisher-Yates shuffle algorithm
      for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
      }
    
      // Update the visualization with the new data values
      rects.data(data)
        .transition()
        .duration(500)
        .attr("x", (d, i) => padding + i * barWidth)
        .attr("y", d => 300 - Math.max(d * 3, 1))
        .attr("height", d => Math.max(d * 3, 1))
        .attr("class", "bar")
    
      labels.data(data)
        .transition()
        .duration(500)
        .attr("x", (d, i) => padding + i * barWidth + barWidth / 2)
        .attr("y", d => 295 - Math.max(d * 3, 1))
        .text(d => d);
    }
    
    async createNewAbortSignal() {
      // If an abort controller already exists, abort it
      if (this.controller) {
        this.controller.abort();
      }
      // Create a new abort controller and return its signal
      this.controller = new AbortController();
      return this.controller.signal;
    }
  
    setDefaultSpeed() {
      // Set the speed menu to the default value (index 0)
      let speedMenu = document.getElementById("menu");
      speedMenu.selectedIndex = 0;
    }
  
    updateDuration() {
      // Get the selected value from the speed menu
      let selectedValue = parseFloat(document.getElementById("menu").value);
    
      // Set the duration based on the selected value
      switch (selectedValue) {
        case 0.5:
          this.duration = 100;
          break;
        case 0.75:
          this.duration = 30;
          break;
        case 1:
          this.duration = 20;
          break;
        case 2:
          this.duration = 10;
          break;
        case 4:
          this.duration = 1;
          break;
        default:
          this.duration = 1;
          break;
      }
      console.log(this.duration);
    }
  
    addMenuEventListener() {
      // Add a change event listener to the speed menu
      document.getElementById("menu").addEventListener("change", () => {
        this.updateDuration();
      });
    }
  
    async pause() {
      // Pause for the duration specified by the Chart class
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, this.duration);
      });
    }
  
    async checkSignal(signal) {
      // Check if the signal has been aborted
      if (signal.aborted) {
        throw new Error('Aborted');
      }
      // Pause for a third of the duration specified by the Chart class
      await this.pause(this.duration / 3);
    }
    
    addRangeSlider() {
      // Add an input event listener to the range slider
      let elem = document.querySelector('input[type="range"]');
      elem.value = elem.min;
      let rangeValue = () => {
        let newValue = elem.value;
        let target = document.querySelector('.value');
        target.innerHTML = newValue;
      }
      elem.addEventListener("input", rangeValue);
    }

    async init() {
      // Set the default speed, update the duration, and add event listeners
      this.setDefaultSpeed();
      this.updateDuration();
      this.addMenuEventListener();
      this.addRangeSlider();
    
      // Update the chart data and store it in the Chart class
      this.chartData = await this.updateChart();
    }
  }
  
class Sort {
  constructor(chart) {
    this.chart = chart;
  }

  async bubbleSort2() {
    
    const { data, rects, labels, barWidth, padding } = this.chart.chartData;
    let swapped = false;
    let iteration = 0;
  
    function markBars(i, j) {
      // Mark the two bars being compared
      rects.filter((d, k) => k === i || k === j)
        .classed("compare", true);
    }

   function compareBars(i, j) {
      // Compare the two bars being compared
      if (data[i] > data[j]) {
        return true;
      }
      return false;
    }

    async function swapBars(i, j) {
      // Use destructuring to swap the values
      [data[i], data[j]] = [data[j], data[i]];
        rects.data(data)
          .transition()
          .duration((chart.duration * 2))  // increase duration time
          .delay(chart.duration * iteration + Math.min(i, j) * chart.duration)
          .attr("x", (d, k) => padding + k * barWidth)
          .attr("y", (d) => 300 - Math.max(d * 3, 1))
          .attr("height", (d) => Math.max(d * 3, 1))
          .attr("class", (d, k) => k === i || k === j ? "compare" : k >= data.length - iteration ? "sorted" : "")
        if (data.length <= 50) {
          labels.data(data)
            .transition()
            .duration((chart.duration * 2))  // increase duration time
            .delay(chart.duration * iteration + Math.min(i, j) * chart.duration)
            .attr("x", (d, k) => padding + k * barWidth + barWidth / 2)
            .attr("y", (d) => 295 - Math.max(d * 3, 1))
            .text((d) => d);
        }
    }
    

    function unmarkBars(i, j) {
      // Unmark the two bars being compared
      rects.filter((d, k) => k === i || k === j).classed("compare", false);
    }

    async function doIteration() {
      swapped = false;
      for (let i = 0; i < data.length - iteration - 1; i++) {
        markBars(i, i + 1);
        if (compareBars(i, i + 1)) {
          swapBars(i, i + 1);
          swapped = true;
        }
        unmarkBars(i, i + 1);
      }
      iteration++;
      return swapped;
    }


    if (this.chart.isSorting) {
      return; // if sorting is already running, do nothing
    }
  
    this.chart.isSorting = true; // set the flag to true to indicate that sorting is starting
  
    // Call doIteration() once before starting the interval
    await doIteration();
  
    this.chart.intervalId = setInterval(async () => {
      swapped = await doIteration();
      if (!swapped) {
        clearInterval(this.chart.intervalId);
        this.chart.isSorting = false; // set the flag to false to indicate that sorting is finished
        // Set the class of all rects to "sorted" to turn them green
        rects.attr("class", "sorted");
  
        // Set a timeout to turn all rects back to red after a second
        setTimeout(() => {
          rects.attr("class", "bar");
        }, 1500);
      }
    }, (chart.duration * 2) + (chart.duration * 100)); // set the interval delay to 0
  }
  
  async bubbleSort3() {

    const { data, rects, labels, barWidth, padding } = this.chart.chartData;

    if (this.chart.isSorting) {
      return; // if sorting is already running, do nothing
    }

    let maxIterations = data.length;
    let swapped = false;
    this.chart.isSorting = true; // set the flag to true to indicate that sorting is starting
    let iteration = 0;

    async function markBars(i, j) {
      // Mark the two bars being compared
      rects.filter((d, k) => k === i || k === j)
        .classed("compare", true);
      await chart.checkSignal(chart.controller.signal) // check if signal is aborted
      await chart.pause();
    }

    async function compareBars(i, j) {
      await chart.checkSignal(chart.controller.signal); // check if signal is aborted
      await  chart.pause();
      // Compare the two bars being compared
      if (data[i] > data[j]) {
        return true;
      }
      return false;
    }

    async function swapBars(i, j) {
      // Use destructuring to swap the values
      [data[i], data[j]] = [data[j], data[i]];
      // Update the visualization
      await new Promise(resolve => {
        rects.data(data)
          .transition()
          .duration(chart.duration / 2)
          .delay(iteration * chart.duration + Math.min(i, j) * chart.duration / 2)
          .attr("x", (d, k) => padding + k * barWidth)
          .attr("y", d => 300 - Math.max(d * 3, 1))
          .attr("height", d => Math.max(d * 3, 1))
          .attr("class", (d, k) => k === i || k === j ? "compare" : k >= data.length - iteration ? "sorted" : "")
          .on("end", () => resolve());

        if (data.length <= 50)
        {
        labels.data(data)
          .transition()
          .duration(chart.duration / 2)
          .delay(iteration * chart.duration + Math.min(i, j) * chart.duration / 2)
          .attr("x", (d, k) => padding + k * barWidth + barWidth / 2)
          .attr("y", d => 295 - Math.max(d * 3, 1))
          .text(d => d)
        }
      });
    }

    async function unmarkBars(i, j) {
      // Unmark the two bars being compared
      rects.filter((d, k) => k === i || k === j)
        .classed("compare", false);
        await chart.checkSignal(chart.controller.signal); // check if signal is aborted
      await  chart.pause(chart.duration);
    }

    while (maxIterations > 0) {
      swapped = false;
      for (let i = 0; i < data.length - iteration - 1; i++) {
        await markBars(i, i + 1);
        if (await compareBars(i, i + 1)) {
          await swapBars(i, i + 1);
          swapped = true;
        }
        await unmarkBars(i, i + 1);
      }
      iteration++;
      maxIterations--;

      // Mark the last element as green
      rects.filter((d, k) => k === data.length - iteration)
      .classed("sorted", true);
      await  chart.pause();
      await chart.checkSignal(chart.controller.signal); // check if signal is aborted

      if (!swapped) {
        this.chart.isSorting = false; // set the flag to false to indicate that sorting is finished
      }
    }

    // If the sorting is finished, turn all bars green for 1500ms
    if (!this.chart.isSorting) {
      // Set the class of all remaining bars to "sorted" to turn them green
      rects.attr("class", "sorted");

      // Set a timeout to turn all rects back to blue after a second
      setTimeout(() => {
        rects.attr("class", "bar");
      }, 1500);
    }
  }

  async selectionSort3() {

    const { data, rects, labels, barWidth, padding } = this.chart.chartData;

    const duration = this.chart.duration;
    const signal = this.chart.controller.signal;

    async function markBars(i) {
      // Mark the bar being moved
      rects.filter((d, k) => k === i)
        .classed("compare", true);
      await chart.checkSignal(signal); // check if signal is aborted
      await chart.pause();
    }

    async function markBarsPurple(i) {
      // Mark the bar being moved
      rects.filter((d, k) => k === i)
        .classed("current", true);
      await chart.checkSignal(signal); // check if signal is aborted
      await chart.pause();
    }

    async function swapBars(i, j) {
      // Use destructuring to swap the values
      [data[i], data[j]] = [data[j], data[i]];
      // Update the visualization
      await new Promise(resolve => {
        rects.data(data)
          .transition()
          .duration(duration / 2)
          .delay(i * duration / 2)
          .attr("x", (d, k) => padding + k * barWidth)
          .attr("y", d => 300 - Math.max(d * 3, 1))
          .attr("height", d => Math.max(d * 3, 1))
          .attr("class", (d, k) => k <= j ? "sorted" : k === i ? "compare" : k > i ? "" : "")
          .on("end", () => resolve());

        if (data.length <= 50) {
          labels.data(data)
            .transition()
            .duration(duration / 2)
            .delay(i * duration / 2)
            .attr("x", (d, k) => padding + k * barWidth + barWidth / 2)
            .attr("y", d => 295 - Math.max(d * 3, 1))
            .text(d => d);
        }
      });
    }

    async function unmarkBars(i) {
      // Unmark the bar that was marked with "current" or "compare"
      rects.filter((d, k) => k === i)
        .classed("current compare", false);
      await chart.checkSignal(signal); // check if signal is aborted
      await chart.pause();
    }

    if (this.chart.isSorting) {
      return; // if sorting is already running, do nothing
    }

    this.chart.isSorting = true; // set the flag to true to indicate that sorting is starting
    
    for (let i = 0; i < data.length - 1; i++) {
      let minIndex = i;
      for (let j = i + 1; j < data.length; j++) {
        await markBarsPurple(minIndex);
        await markBars(j);
        if (data[j] < data[minIndex]) {
          await unmarkBars(minIndex);
          minIndex = j;
        }
        await unmarkBars(j);
        await markBarsPurple(minIndex);
      }
      await markBars(minIndex);
      await markBars(i);
      await chart.pause();
      await swapBars(minIndex, i);
      await unmarkBars(minIndex);
    }

    this.isSorting = false; // set the flag to false to indicate that sorting is finished

    // If the sorting is finished, turn all bars green for 1500ms
    if (!this.isSorting) {
      // Set the class of all remaining bars to "sorted" to turn them green
      rects.attr("class", "sorted");

      // Set a timeout to turn all rects back to red after a second
      setTimeout(() => {
        rects.attr("class", "bar");
      }, 1500);
    }
  }

  async insertionSort3() {

    const { data, rects, labels, barWidth, padding } = this.chart.chartData;

    const duration = this.chart.duration;
    const signal = this.chart.controller.signal;

    async function markBars(i) {
      // Mark the bar being moved
      rects.filter((d, k) => k === i)
        .classed("compare", true);
      await chart.checkSignal(signal); // check if signal is aborted
      await chart.pause();
    }

    async function compareBars(i, j) {
      await chart.checkSignal(signal); // check if signal is aborted
      await chart.pause();
      // Compare the two bars being compared
      if (data[i] < data[j]) {
        return true;
      }
      return false;
    }

    async function swapBars(i, j) {
      // Use destructuring to swap the values
      [data[i], data[j]] = [data[j], data[i]];
      // Update the visualization
      await new Promise(resolve => {
        rects.data(data)
          .transition()
          .duration(duration / 2)
          .delay(j * duration / 2)
          .attr("x", (d, k) => padding + k * barWidth)
          .attr("y", d => 300 - Math.max(d * 3, 1))
          .attr("height", d => Math.max(d * 3, 1))
          .attr("class", (d, k) => k === i || k === j ? "compare" : "")
          .on("end", () => resolve());
          if (data.length <= 50)
          {
        labels.data(data)
          .transition()
          .duration(duration / 2)
          .delay(j * duration / 2)
          .attr("x", (d, k) => padding + k * barWidth + barWidth / 2)
          .attr("y", d => 295 - Math.max(d * 3, 1))
          .text(d => d)
        }
      });
    }

    async function unmarkBars(i) {
      // Unmark the bar being moved
      rects.filter((d, k) => k === i)
        .classed("compare", false);
      await chart.checkSignal(signal); // check if signal is aborted
      await chart.pause();
    }

    if (this.chart.isSorting) {
      return; // if sorting is already running, do nothing
    }

    this.chart.isSorting = true; // set the flag to true to indicate that sorting is starting

    for (let i = 0; i < data.length - 1; ++i) {
      let j = i;
      while (j >= 0 && await compareBars(j+1, j)) {
        await markBars(j);
        await markBars(j + 1);
        await chart.pause();
        await swapBars(j, j + 1);
        await unmarkBars(j);
        await unmarkBars(j + 1);
        j -= 1;
      }
    }
  // If the sorting is finished, turn all bars green for 1500ms
    if (!this.isSorting) {
      // Set the class of all remaining bars to "sorted" to turn them green
      rects.attr("class", "sorted");

      // Set a timeout to turn all rects back to red after a second
      setTimeout(() => {
        rects.attr("class", "bar");
      }, 1500);
    }
  }

  async someMethod() {
    // Call the updateChart() method of the Chart instance to populate chartData
    const chartData = await this.chart.updateChart();

    // Use chartData in this method as needed
    console.log(chartData);
  }
}

/*=================== CALL OF ACTION ======================== */

  const slider = document.getElementById("range-slider");
  const chart = new Chart();
  chart.init();

  const sort = new Sort(chart);
  sort.someMethod();
  
  d3.select("#update")
    .on("click", async () => {
      chart.controller.abort();
      await new Promise(resolve => setTimeout(resolve, 500));
      await chart.updateChart();
      chart.chartData = await chart.updateChart();

      console.log(chart);
    });
  
    d3.select("#randomize")
    .on("click", async () => {
      chart.controller.abort();
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 0.5 seconds
      await chart.randomizeData();
    });

    d3.select("#bubblesort2").on("click", async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 0.5 seconds
      const sort = new Sort(chart);
      await sort.bubbleSort2();
    });

    d3.select("#bubblesort3").on("click", async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 0.5 seconds
      const sort = new Sort(chart);
      await sort.bubbleSort3();
    });

    d3.select("#selectionsort3").on("click", async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 0.5 seconds
      const sort = new Sort(chart);
      await sort.selectionSort3();
    });

    d3.select("#insertionsort3").on("click", async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 0.5 seconds
      const sort = new Sort(chart);
      await sort.insertionSort3();
    });

/*=================== CALL OF ACTION END ======================== */