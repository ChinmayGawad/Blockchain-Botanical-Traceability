import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../../src/components/common/MetricCard';
import { Scale } from 'lucide-react';

describe('MetricCard Component Unit Tests', () => {
  it('should render title, value, and subtitle accurately', () => {
    render(
      <MetricCard
        title="Harvested Volume"
        value="450 kg"
        subtitle="Across all organic crops"
        icon={Scale}
        iconColor="text-emerald-700"
        bgColor="bg-emerald-50"
      />
    );

    expect(screen.getByText('Harvested Volume')).toBeInTheDocument();
    expect(screen.getByText('450 kg')).toBeInTheDocument();
    expect(screen.getByText('Across all organic crops')).toBeInTheDocument();
  });

  it('should render optional trend badge when provided', () => {
    render(
      <MetricCard
        title="Active Batches"
        value={12}
        icon={Scale}
        trend={{ value: '15% vs last month', isPositive: true }}
      />
    );

    expect(screen.getByText('Active Batches')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('15% vs last month')).toBeInTheDocument();
  });
});
