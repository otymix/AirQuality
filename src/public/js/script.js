      // Create a disclaimer alert

      function createDisclaimerSection() {
        const container = document.createElement("div");
        container.className = "mt-3";

        // Create toggle button
        const toggleButton = document.createElement("button");
        toggleButton.className = "btn btn-sm btn-info mb-2";
        toggleButton.innerHTML = "📖 Show Usage Guide";

        // Create disclaimer content (hidden by default)
        const disclaimer = document.createElement("div");
        disclaimer.id = "disclaimer";
        disclaimer.className = "alert alert-info collapse"; // Using Bootstrap's collapse
        disclaimer.innerHTML = `
          <h4 class="alert-heading">📊 Usage Guide</h4>
          <p>For optimal visualization of the air quality data:</p>
          <ul>
              <li>Select first a time window and fetch the data </li>
              <li>If intereseted in only one field, do use the dropdown menu to view its specific measurements</li>
              <li>Click on legend items 👇 to show/hide different measurements</li>
              <li>Double-click the chart to reset the view and display all fields again</li>
              <li>Hover over data points for detailed values</li>
          </ul>
          <hr>
          <p class="mb-0">Note: All measurements are displayed in their respective units and updated in real-time.</p>
      `;

        // Toggle functionality
        let isVisible = false;
        toggleButton.onclick = () => {
          isVisible = !isVisible;
          const toShow = isVisible ? "block" : "none";
          console.log({ isVisible });
          toggleButton.innerHTML = isVisible
            ? "📖 Hide Usage Guide"
            : "📖 Show Usage Guide";
          document.getElementById("disclaimer").style.display = toShow; // Using Bootstrap's collapse
          //document.querySelector(".collapse").style.display = "block";
        };

        container.appendChild(toggleButton);
        container.appendChild(disclaimer);

        return container;
      }

      // Add to your page
      document.querySelector("#notice").appendChild(createDisclaimerSection());

      const fieldsList = [
        {
          name: "co",
          color: "#FF6384", // bright pink/red
        },
        {
          name: "pt08_s1_co",
          color: "#36A2EB", // bright blue
        },
        {
          name: "nmhc",
          color: "#FFCE56", // yellow
        },
        {
          name: "benzene",
          color: "#4BC0C0", // turquoise
        },
        {
          name: "pt08_s2_nmhc",
          color: "#9966FF", // purple
        },
        {
          name: "nox",
          color: "#FF9F40", // orange
        },
        {
          name: "pt08_s3_nox",
          color: "#32CD32", // lime green
        },
        {
          name: "no2",
          color: "#BA55D3", // medium orchid
        },
        {
          name: "pt08_s4_no2",
          color: "#20B2AA", // light sea green
        },
        {
          name: "pt08_s5_o3",
          color: "#FF4500", // orange red
        },
        {
          name: "temperature",
          color: "#8B0000", // dark red
        },
        {
          name: "relative_humidity",
          color: "#4169E1", // royal blue
        },
        {
          name: "absolute_humidity",
          color: "#2F4F4F", // dark slate gray
        },
      ];

      // Function to create the select element
      function createParameterSelect() {
        // Create the container div
        const containerDiv = document.createElement("div");
        containerDiv.className = "col-md-4";

        // Create label
        const label = document.createElement("label");
        label.htmlFor = "parameter";
        label.className = "form-label";
        label.textContent = "Select a field";

        // Create select element
        const select = document.createElement("select");
        select.id = "parameter";
        select.className = "form-select";

        // Add empty default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select a parameter";
        defaultOption.selected = true;
        defaultOption.disabled = true;
        select.appendChild(defaultOption);

        // Add options from parameters array
        fieldsList.forEach((param) => {
          const option = document.createElement("option");
          option.value = param.name;
          // Format the display text (capitalize and replace underscores)
          option.textContent = param.name.toUpperCase();
          select.appendChild(option);
        });

        // Assemble the elements
        containerDiv.appendChild(label);
        containerDiv.appendChild(select);

        // Add to the document (assuming you have a container element)
        document.querySelector("#selector").appendChild(containerDiv);
      }

      // Call the function
      createParameterSelect();

      const fetchDataButton = document.getElementById("fetchData");
      const parameterSelect = document.getElementById("parameter");
      const startDateInput = document.getElementById("startDate");
      const endDateInput = document.getElementById("endDate");
      const ctx = document.getElementById("airQualityChart").getContext("2d");
      let chart;

      const combineDateAndTime = (dateUnix, timeStr) => {
        try {
          const baseDate = new Date(parseInt(dateUnix) * 1000);

          if (isNaN(baseDate.getTime())) {
            throw new Error("Invalid date timestamp");
          }

          const [hours, minutesWithSeconds] = timeStr.split(":");
          const minutes = minutesWithSeconds.split(".")[0];

          baseDate.setHours(Number(hours));
          baseDate.setMinutes(Number(minutes));

          return baseDate;
        } catch (error) {
          console.error("Error parsing date/time:", error);
          return null;
        }
      };

      const formatDateForChart = (timestamp, hour, format = "iso") => {
        const fullDate = combineDateAndTime(timestamp, hour);
        const date = new Date(fullDate);
        // console.log({ timestamp, hour, fullDate, date });
        return date;
      };

      fetchDataButton.addEventListener("click", () => {
        const parameter = parameterSelect.value;
        const startDate = startDateInput.value
          .split("-")
          .reverse()
          .join("/");

        const endDate = endDateInput.value
          .split("-")
          .reverse()
          .join("/");

        if (!startDate || !endDate) {
          showAlert("Please select both start and end dates.",'warning');
          return;
        }

        const backendUrl = `http://localhost:3000/api/data?startDate=${startDate}&endDate=${endDate}`;

        fetch(backendUrl)
          .then((response) => response.json())
          .then((data) => {
            const labels = data.map((item) =>
              formatDateForChart(item.date, item.time, "date")
            );
            const values = data.map((item) => item.co);
            console.log({ labels, values });

            if (chart) {
              chart.destroy(); // Destroy previous chart instance
            }

            console.log("Length :", fieldsList.length);

            const datasets = fieldsList.map((field) => ({
              label: `Time Series for ${field.name.toUpperCase()}`,
              data: data.map((item) => item[field.name]),
              borderColor: field.color,
              backgroundColor: field.color,
              fill: false,
              tension: 0.1,
            }));


            chart = new Chart(ctx, {
              type: "line",
              data: {
                labels: labels,
                datasets,
              },
              options: {
                responsive: true,
                interaction: {
                  mode: "index",
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: "top",
                    onClick: (evt, legendItem, legend) => {
                      console.log(datasets[0].data.length)
                      if(datasets[0].data.length > 1500){
                        showAlert("Too Much data to filter! Try narrowing down the time window of the search for a smooth user experience!",'info')
                      }
                      else
                      {
                      const index = legendItem.datasetIndex;
                      const ci = legend.chart;

                        // Toggle clicked dataset
                      if (ci.isDatasetVisible(index)) {
                        console.log("Will Hide...", index, legend.chart);
                        ci.hide(index);
                        legendItem.hidden = true;
                      } else {
                        console.log("Will SHOW...", index, legend.chart);
                        ci.show(index);
                        legendItem.hidden = false;
                      }

                      // Optional: Hide all other datasets when one is clicked
                      ci.data.datasets.forEach((_dataset, idx) => {
                        if (idx !== index) {
                          ci.hide(idx);
                          legend.legendItems[idx].hidden = true;
                        }
                      });

                      }

                    },
                  },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || "";
                        return `${label}: ${context.parsed.y.toFixed(2)}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    type: "time", // Time scale for x-axis
                    title: {
                      display: true,
                      text: "Date",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Value",
                    },
                  },
                },
              },
            });

            // Add double-click handler to show all datasets
            chart.canvas.addEventListener("dblclick", () => {
              chart.data.datasets.forEach((_dataset, index) => {
                chart.show(index);
                chart.legend.legendItems[index].hidden = false;
              });
              chart.update();
            });
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
             showAlert("Failed to fetch data. Please check the console for details.",'danger');
          });
      });

      // First, create a function to handle the chart update
      const updateChart = (selectedParameter, url) => {
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            const labels = data.map((item) =>
              formatDateForChart(item.date, item.time, "date")
            );

            if (chart) {
              chart.destroy();
            }

            // Create datasets only for selected parameters
            const datasets = [];
            const selectedParams = selectedParameter.split(","); // In case of multiple selections

            selectedParams.forEach((param) => {
              if (data[0].hasOwnProperty(param)) {
                datasets.push({
                  label: `Time Series for ${param.toUpperCase()}`,
                  data: data.map((item) => item[param]),
                  borderColor: fieldsList.find((e) => e.name === param).color,
                  backgroundColor: fieldsList.find((e) => e.name === param)
                    .color,
                  fill: false,
                  tension: 0.1,
                });
              }
            });

            chart = new Chart(ctx, {
              type: "line",
              data: {
                labels: labels,
                datasets: datasets,
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  x: {
                    type: "time",
                    title: {
                      display: true,
                      text: "Date",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Value",
                    },
                  },
                },
              },
            });
          });
      };

      // Initial chart load with default selection
      updateChart(document.getElementById("parameter").value);

      // Add event listener to the select element
      parameterSelect.addEventListener("change", (e) => {
        const parameter = parameterSelect.value;
        const startDate = startDateInput.value
          .split("-")
          .reverse()
          .join("/");

        const endDate = endDateInput.value
          .split("-")
          .reverse()
          .join("/");

        if (!startDate || !endDate) {
          showAlert("Please, First select both start and end dates.",'warning');
          return;
        }

        const backendUrl = `http://localhost:3000/api/data?startDate=${startDate}&endDate=${endDate}`;
        console.log(" Sleected ", e.target.value);
        updateChart(e.target.value, backendUrl);
      });


  const showAlert = (message, type = 'info') => {
    const alertContainer = document.getElementById('alertContainer');
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
};