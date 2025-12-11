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
              <stop offset="5%" stopColor="#0a8a58" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#0a8a58" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#212121', 
              color: '#fff', 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: '500'
            }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            labelStyle={{ display: 'none' }}
            cursor={{ stroke: '#0a8a58', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#0a8a58" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
