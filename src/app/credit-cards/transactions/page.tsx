"use client";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
      text: "Credit Card Debt To Account Balance  ",
    },
  },
  scales: {
    y: {
      type: "linear" as const,
      display: true,
      position: "left" as const,
    },
    y1: {
      type: "linear" as const,
      display: true,
      position: "right" as const,
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

const labels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const creditCardDebtByMonth = [
  5200, 4800, 5300, 5100, 4950, 4700, 4600, 4500, 4400, 4300, 4200, 4100,
];

const accountBalanceByMonth = [
  6000, 6100, 6050, 6150, 6200, 6300, 6400, 6500, 6600, 6700, 6800, 6900,
];

const data = {
  labels,
  datasets: [
    {
      label: "Credit Card Debt",
      data: creditCardDebtByMonth,
      borderColor: "rgb(197, 35, 189)",
      backgroundColor: "rgb(197, 35, 189)",
      yAxisID: "y",
    },
    {
      label: "Account Balance",
      data: accountBalanceByMonth,
      borderColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(255, 255, 255)",
      yAxisID: "y1",
    },
  ],
};

export default function creditTrans() {
  return (
    <div>
      <Line options={options} data={data} />
      <div>
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th scope="col fs-5">#</th>
              <th scope="col fs-5">Date</th>
              <th scope="col fs-5">Amount</th>
              <th scope="col fs-5">Recipient</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>10/1/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$140</div>
              </td>
              <td>Paypal</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>5/2/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$200</div>
              </td>
              <td>Amazon Pay</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td>28/2/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$390</div>
              </td>
              <td>Netflix</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">4</th>
              <td>9/3/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$16</div>
              </td>
              <td>Ahmed Gomaa</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">5</th>
              <td>12/4/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$2380</div>
              </td>
              <td>Paypal</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">6</th>
              <td>30/4/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$1805</div>
              </td>
              <td>SE Project</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">7</th>
              <td>6/5/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$1823.20</div>
              </td>
              <td>Generic Supermarket</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">8</th>
              <td>9/6/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$80</div>
              </td>
              <td>Apple</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">9</th>
              <td>11/7/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$63</div>
              </td>
              <td>Paypal</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">10</th>
              <td>22/7/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$27</div>
              </td>
              <td>Gomaa Electronics</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">11</th>
              <td>12/8/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$620</div>
              </td>
              <td>Netflix</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">12</th>
              <td>6/9/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$108</div>
              </td>
              <td>Shopify</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">13</th>
              <td>25/9/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$523.53</div>
              </td>
              <td>Paypal</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">14</th>
              <td>9/10/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$243</div>
              </td>
              <td>Amazon</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
            <tr>
              <th scope="row">15</th>
              <td>1/12/2022</td>
              <td>
                <div className="badge rounded-pill text-bg-info">$700</div>
              </td>
              <td>Spotify</td>
              <td>
                <i className="bi bi-credit-card"></i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>&copy; 2023 - btatesM7amara.com (Terms and Conditions Apply)</p>
    </div>
  );
}
