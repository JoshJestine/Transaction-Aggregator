import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const IncomeChart = ({ data }) => {
    // Calculate average for the forecast summary
    const futureData = data.filter(d => d.isForecast);
    const averageFutureIncome = futureData.reduce((acc, curr) => acc + curr.amount, 0) / (futureData.length || 1);

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3>Income Stability Forecast</h3>
                <div className="chart-legend">
                    <span className="legend-item historical">Historical</span>
                    <span className="legend-item forecast">Forecast</span>
                </div>
            </div>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#666', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [`$${value}`, 'Income']}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#4F46E5"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-summary">
                <p>
                    <strong>Forecast:</strong> Your income shows a positive trend.
                    Expected average: <strong>${averageFutureIncome.toFixed(0)}</strong> over the next 3 months.
                </p>
            </div>
        </div>
    );
};

export default IncomeChart;
