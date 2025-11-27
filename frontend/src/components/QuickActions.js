import React from 'react';
import { Upload, Plus, Bot } from 'lucide-react';

const QuickActions = () => {
    return (
        <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
                <button className="action-button secondary">
                    <Upload size={20} />
                    <span>Upload CSV</span>
                </button>
                <button className="action-button secondary">
                    <Plus size={20} />
                    <span>Add Income</span>
                </button>
                <button className="action-button secondary">
                    <Plus size={20} />
                    <span>Add Expense</span>
                </button>
                <button className="action-button primary">
                    <Bot size={20} />
                    <span>Open AI Advisor</span>
                </button>
            </div>
        </div>
    );
};

export default QuickActions;
