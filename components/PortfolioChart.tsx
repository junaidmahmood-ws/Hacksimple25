import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { ChartDataPoint } from '../types';

interface PortfolioChartProps {
  data: ChartDataPoint[];
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#15803d" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#15803d" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ backgroundColor: '#064e3b', color: '#fff', borderRadius: '12px', border: '1px solid #065f46', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            labelStyle={{ display: 'none' }}
            cursor={{ stroke: '#15803d', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#15803d" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
