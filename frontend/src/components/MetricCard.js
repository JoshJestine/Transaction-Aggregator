import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, type, trend, icon: Icon, description }) => {
    const isPositive = type === 'income' || (type === 'savings' && trend > 0);

    return (
        <div className={`metric - card ${type} `}>
            <div className="metric-header">
                <span className="metric-title">{title}</span>
                {Icon && <Icon size={20} className="metric-icon" />}
            </div>
            <div className="metric-content">
                {value && <h2 className="metric-value">{value}</h2>}
                {description && <p className="metric-description">{description}</p>}
            </div>
            {trend && (
                <div className={`metric - trend ${isPositive ? 'positive' : 'negative'} `}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{Math.abs(trend)}% from last month</span>
                </div>
            )}
        </div>
    );
};

export default MetricCard;
