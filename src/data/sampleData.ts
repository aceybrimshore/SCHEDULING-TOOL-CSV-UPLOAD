import { LocationRule } from '../types';

export const INITIAL_LOCATION_RULES: LocationRule[] = [
  { id: 'loc-sydney', locationName: 'Sydney', subsidiaryId: 7, locationId: 25 },
  { id: 'loc-melbourne', locationName: 'Melbourne', subsidiaryId: 7, locationId: 28 },
  { id: 'loc-brisbane', locationName: 'Brisbane', subsidiaryId: 7, locationId: 30 },
  { id: 'loc-perth', locationName: 'Perth', subsidiaryId: 7, locationId: 32 },
  { id: 'loc-auckland', locationName: 'Auckland', subsidiaryId: 12, locationId: 40 },
];

export const SAMPLE_CSV_CONTENT = `location,product,Sum of Internal ID,Sum of UnitsToProduce,Sum of min_order_qty,Sum of stock_on_hand,Sum of cust_orders,Sum of purch_orders,Sum of WeeklyForecast,Sum of LaborRequired,Sum of Labor Ttl Hrs,Sum of PriorityScore,Sum of PriorityRank,First PriorityDriver,First classification,Has Sub?
Sydney,710-RSL-00003,138516,17,1,0,11,1,7,0.85,0.05,1011044,5,Committed Sales Orders,Stocked,YES
Sydney,CSL30M-ERG,239005,1,0,0,2,1,0,0.53,0.53,1000788.14,15,Committed Sales Orders,Zero Policy,YES
Sydney,GRA-0B25-045130,220742,10,0,0,10,0,0,0.3,0.03,1000086.4,27,Committed Sales Orders,Zero Policy,YES
Sydney,MS30M,66687,120,40,6,144,160,120,32.4,0.27,1052800.54,3,Committed Sales Orders,Stocked,YES
Sydney,P46-100,7740,20,20,0,7,20,22,6.6,0.33,1000973.21,13,Committed Sales Orders,Stocked,YES
Sydney,PZQ3075060,18452,30,15,0,13,45,62,45,1.5,1012749.62,4,Committed Sales Orders,Stocked,YES
Sydney,PZQ3089050,18453,294,126,0,672,1050,656,88.2,0.3,1128634.24,1,Committed Sales Orders,Stocked,YES
Sydney,VN1VZ9955106R,191805,40,0,4,9,40,54,3.2,0.08,1001787.5,11,Committed Sales Orders,Zero Policy,YES
Sydney,VN1WZ9955106F,171533,48,0,1,34,48,63,4.8,0.1,1006230.07,6,Committed Sales Orders,Zero Policy,YES
Sydney,5867641570,110926,20,10,2,6,20,30,7.4,0.37,1000853.2,14,Committed Sales Orders,Stocked,
Sydney,B120010-BP,180071,12,10,16,38,40,30,0.12,0.01,1000119.9,24,Committed Sales Orders,Stocked,
Sydney,B130-BP,16858,100,100,0,40,100,115,2,0.02,1000432.19,17,Committed Sales Orders,Stocked,
Sydney,DK208,8053,20,10,4,21,0,1,1.4,0.07,1000563.15,16,Committed Sales Orders,Stocked,
Sydney,LR680,66683,80,80,0,53,80,57,2.4,0.03,1002477.95,9,Committed Sales Orders,Stocked,
Sydney,N001-BP,16936,20,20,0,8,20,16,0.2,0.01,1000098.49,25,Committed Sales Orders,Stocked,
Sydney,N002-BP,16937,200,200,2,38,200,224,4,0.02,1000129.133,23,Committed Sales Orders,Stocked,
Sydney,PZQ3060360,218382,126,126,0,287,378,140,28.98,0.23,1060054.75,2,Committed Sales Orders,Stocked,
Sydney,RAS,18471,57,57,7,8,0,2,1.14,0.02,1000012.09,28,Committed Sales Orders,Stocked,
Sydney,RDB120P,223466,216,216,35,61,216,217,8.64,0.04,1001243.65,12,Committed Sales Orders,Stocked,
Sydney,RDB165,120732,30,30,8,57,60,21,2.4,0.08,1004767.686,8,Committed Sales Orders,Stocked,
Sydney,RL150S11,8477,192,192,57,69,0,141,21.12,0.11,1000268.86,19,Committed Sales Orders,Stocked,
Sydney,RLT600,2256,384,192,148,161,192,485,69.12,0.18,1001889.17,10,Committed Sales Orders,Stocked,
Sydney,RLTPMV04,8533,24,0,0,4,0,0,2.88,0.12,1000412.48,18,Committed Sales Orders,Non-Stocked,
Sydney,RMFT530A,102685,24,24,6,11,24,25,13.2,0.55,1004769.35,7,Committed Sales Orders,Stocked,
Sydney,S602,19035,18,18,0,9,18,12,0.54,0.03,1000234.55,21,Committed Sales Orders,Stocked,
Sydney,SP334,80989,19,19,0,6,19,28,0.19,0.01,1000094.06,26,Committed Sales Orders,Stocked
`;
